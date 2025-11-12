import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import connectDB from './config/mongodb.js';
import rateLimiter from './middleware/rateLimiter.js'; // optional, if you have

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB first
connectDB().then(() => {
    console.log("Database Connected");

    // Middleware
    if (process.env.NODE_ENV !== 'production') {
        console.log("Development Mode: CORS enabled for http://localhost:5173");
        app.use(cors({
            origin: "http://localhost:5173",
            credentials: true
        }));
    }

    app.use(express.json());
    app.use(cookieParser());
    if (rateLimiter) app.use(rateLimiter); // optional

    // Log requests (optional)
    app.use((req, res, next) => {
        console.log(`req method: ${req.method}, req url: ${req.url}`);
        next();
    });

    // API Routes
    app.use("/api/auth", authRouter);
    app.use("/api/user", userRouter);

    // Serve React frontend in production
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../client/dist')));
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../client/dist/index.html'));
        });
    } else {
        // Simple API check in development
        app.get('/', (req, res) => res.send('API Working!'));
    }

    // Start server
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

});
