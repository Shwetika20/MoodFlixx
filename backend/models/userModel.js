import pkg from 'jsonwebtoken';  // Import the entire package
const { verify } = pkg;

import mongoose from "mongoose";

// Define the schema for User
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  moviesHistory: {
    type: [
      {
        movie_id: {
          type: String,
          required: true,
        },
        watchedAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
    default: [] 
  }
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
