import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { text } from 'express';
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from '../config/emailTemplate.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create and save the user
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword
    });

    // 5. Create a JWT token (optional)
    const token = jwt.sign({ id: newUser._id }, "your_jwt_secret", { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      },
      token
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if all fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Find the user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 4. Generate JWT token
    const token = jwt.sign({ id: user._id }, "MoodStart", { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: 'Logged out' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
//Send verification OTP to Users Email
export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        if (user.isAccountVerified) {
            return res.json({ success: false, message: 'Account already verified' });
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            //text: `Hello ${user.name} \n Your OTP for account verification is ${otp}`,
            html: EMAIL_VERIFY_TEMPLATE.replace('{{email}}', user.email).replace('{{otp}}', otp),
        };
        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: 'Verification OTP sent successfully' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
//Verify Email with OTP
export const VerifyEmail = async (req, res) => {
    const { userId, otp } = req.body;
    if (!userId) {
        return res.json({ success: false, message: 'Missing User Id' });
    }
    if (!otp) {
        return res.json({ success: false, message: 'Missing OTP' });
    }
    try {
        const user = await userModel.findById(userId);
        if (user.verifyOtp !== otp || user.verifyOtp === '') {
            return res.json({ success: false, message: 'Invalid OTP' });
        }
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired' });
        }
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = null;
        await user.save();
        return res.json({ success: true, message: 'Email Verified Successfully' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({success: true})
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const SendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: 'Email is required' });
    }
    try {
        const user = await userModel.findOne({email});
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now()+ 24 * 60 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Password Reset Otp',
            //text:`Your otp for reseting password is ${otp}`
            html: PASSWORD_RESET_TEMPLATE.replace('{{email}}', email).replace('{{otp}}', otp),
        }
        await transporter.sendMail(mailOptions);
        return res.json({success:true,message:'Reset Otp sent successfully'})
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const resetPassword = async(req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Email,Otp and new Password are Required' });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({ success: false, message: 'Invaild OTP' });
        }
        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({success:false,message:"OTP Expired"})
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = null;
        await user.save();
        return res.json({ success: true, message: 'Password Reset Successfull' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
