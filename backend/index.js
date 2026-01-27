// const express = require('express');
// const app = express();
// require('dotenv').config();

// require("./models/db")();

// const port = process.env.PORT || 8080;




// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/db.js";

// const express = require('express');
// const app = express();
// require('dotenv').config();

// require("./models/db")();

// const port = process.env.PORT || 8080;




// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/db.js";

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

dotenv.config();
connectDB();

const app = express();

// 1. Basic Middlewares
app.use(cookieParser());
app.use(express.json());

// 2. Custom CORS Logic (Crash-proof version)
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://sales-crm-frontend-puce.vercel.app"
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Pre-flight (OPTIONS) request ko handle karne ka sabse stable tareeka
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// 3. Health Check
app.get("/check", (req, res) => {
  res.send("API working and CORS fixed!");
});

// 4. Routes
app.use("/api/leads", require("./routes/leadRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// 5. Port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);