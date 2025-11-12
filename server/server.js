import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import connectDB from './config/mongodb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Allowed origins for CORS
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://mern-auth-fbtb.onrender.com'] // Render domain
    : ['http://localhost:5173'];

// Always enable CORS with credentials
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // important for cookies
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  console.log('Production mode: serving React from Express');
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Catch-all route: serve React app for non-API routes
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    } else {
      next(); // Let API routes handle the request
    }
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
