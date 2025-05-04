import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('DataBase Connected');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1); // Exit the process in case of an error
  }
};

export default connectDB;
