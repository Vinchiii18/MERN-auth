import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import connectDB from './config/mongodb.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Determine __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS setup for local dev
const allowedOrigins = ['http://localhost:5173'];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// -------------------- API ROUTES --------------------
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// -------------------- Serve React in Production --------------------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
} else {
  // Local dev root
  app.get('/', (req, res) => res.send('API Working!'));
}

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
