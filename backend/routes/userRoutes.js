import express from 'express';
import userAuth from '../middleware/userAuth.js';
import userModel from '../models/userModel.js';
import { getUserData } from '../controllers/UserController.js';

const userRouter = express.Router();

userRouter.get('/profile', userAuth, getUserData);

// Save movie to history
userRouter.post('/save-movie',userAuth, async (req, res) => {
  const { name, genre, overview } = req.body;

  if (!name || !genre || !overview) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const user = await userModel.findById(req.user.id);
    user.moviesHistory.push({ name, genre, overview });
    await user.save();

    res.status(200).json({ message: 'Movie saved to history' });
  } catch (error) {
    console.error('Error saving movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default userRouter;
