import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authroutes from "./routes/authroutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 1000;
//console.log("MongoDB URL:", process.env.MONGODB_URL);
connectDB();

const allowedOrigins = ['*'];

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

app.use(cookieParser());

// API Routes
app.get('/', (req, res) => res.send("API Working"));
app.use('/api/auth', authroutes);
app.use('/api/user', userRouter);

app.listen(port, () => console.log(`Server Started on ${port}`));
