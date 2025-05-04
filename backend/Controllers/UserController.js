import userModel from '../models/userModel.js';

export const getUserData = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id); // From verified token in userAuth middleware

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      name: user.name,
      email: user.email,
      moviesHistory: user.moviesHistory,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



