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

// Detect if in production
const isProduction = process.env.NODE_ENV === 'production';

// CORS
const allowedOrigins = isProduction
  ? ['https://mern-auth-fbtb.onrender.com'] // Replace with your Render domain
  : ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigins, credentials: true }));

// Middleware
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Serve React Frontend in Production
if (isProduction) {
  // Serve static files
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Serve React for all other routes
  app.all('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
} else {
  // Local dev: simple API check
  app.get('/', (req, res) => res.send('API Working!'));
}

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
