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
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// CORS
const allowedOrigins = ['http://localhost:5173']; // local dev only
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Middleware
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Serve React Frontend in Production
if (process.env.NODE_ENV === 'production') {
  // Make sure this path matches your built React app
  const clientDistPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDistPath));

  // Any route not starting with /api serves React
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Local dev: simple API check
  app.get('/', (req, res) => res.send('API Working!'));
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
