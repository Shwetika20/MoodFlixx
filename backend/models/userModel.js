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
        name: {
          type: String,
          required: true,
        },
        genre: {
          type: String,
          required: true,
        },
        overview: {
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
