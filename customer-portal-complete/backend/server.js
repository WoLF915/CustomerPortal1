// server.js

import express from "express";

import mongoose from "mongoose";

import cors from "cors";

import dotenv from "dotenv";

import session from "express-session";

import authRoutes from "./routes/auth.js";

import { User } from "./models/User.js";



dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://localhost:3001', 'https://localhost:5173'], credentials: true }));



// Session configuration

app.use(session({

  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',

  resave: false,

  saveUninitialized: false,

  cookie: {

    secure: false, // Set to true in production with HTTPS

    httpOnly: true,

    maxAge: 30 * 60 * 1000, // 30 minutes

    sameSite: 'lax'

  }

}));



// Connect to MongoDB

mongoose

  .connect(process.env.MONGO_URI)

  .then(() => console.log("✅ Connected to MongoDB Atlas"))

  .catch((error) => console.error("❌ MongoDB connection error:", error));



// Mount API routes

app.use("/api/auth", authRoutes);



const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Handle port already in use error gracefully
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error('Please kill the process using this port or use a different port.');
    console.error('On Windows, run: netstat -ano | findstr :' + PORT);
    console.error('Then kill the process: taskkill /PID <PID> /F');
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});
