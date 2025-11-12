import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import connectDB from './config/mongodb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Determine allowed origins dynamically
const allowedOrigins = [
  'http://localhost:5173',          // local dev
  process.env.RENDER_EXTERNAL_URL    // Render assigned domain (auto)
].filter(Boolean); // remove undefined if not on Render

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Serve React frontend if build exists
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // Catch all non-API routes and send React index.html
  app.all('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Local dev fallback if dist not built
  app.get('/', (req, res) => res.send('API Working!'));
}

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Allowed Origins:', allowedOrigins.join(', '));
});
