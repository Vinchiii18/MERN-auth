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

// Detect production environment (Render sets process.env.RENDER)
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

// CORS
const allowedOrigins = isProduction
  ? ['https://mern-auth-fbtb.onrender.com'] // replace with your Render domain if it changes
  : ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigins, credentials: true }));

// Middleware
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Serve React Frontend (Production)
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Serve React index.html for all unknown routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
} else {
  // Local dev: API check
  app.get('/', (req, res) => res.send('API Working!'));
}

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
