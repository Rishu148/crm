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
app.use(cookieParser());

app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://sales-crm-frontend-puce.vercel.app" // 👈 Ye wala naya link dalo
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✨ Pre-flight requests (204 error) ko handle karne ke liye
// '*' ki jagah '(.*)' use karo naye versions ke liye
app.options('(.*)', cors());


// app.use(cors());
app.use(express.json());



app.get("/check", (req, res) => {
  res.send("API working");
});










// server.js ke andar
const leadRoutes = require("./routes/leadRoutes");
app.use("/api/leads", leadRoutes);



app.use("/api/auth", require("./routes/authRoutes"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);