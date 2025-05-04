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
// DELETE /api/user/history/:id
userRouter.delete('/history/:id', userAuth, async (req, res) => {
  const userId = req.user.id;
  const movieId = req.params.id;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Optional: check if movie exists in history
    const exists = user.moviesHistory.some(
      (movie) => movie._id.toString() === movieId
    );
    if (!exists) {
      return res.status(404).json({ message: 'Movie not found in history.' });
    }

    user.moviesHistory = user.moviesHistory.filter(
      (movie) => movie._id.toString() !== movieId
    );
    await user.save();

    res.json({ message: 'Movie deleted from history.' });
  } catch (err) {
    console.error('Error deleting movie from history:', err); // log the real error
    res.status(500).json({ message: 'Server error while deleting movie.' });
  }
});


export default userRouter;
