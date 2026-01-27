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

// app.use(cors());
app.use(express.json());



app.get("/check", (req, res) => {
  res.send("API working");
});




app.use(cookieParser());

app.use(cors({
  // Yahan apna Vercel ka link aur localhost dono daal do
  origin: [
    "http://localhost:5173", 
    "https://sales-ftbt3fm1k-rishu148s-projects.vercel.app" // Tera Vercel URL
  ],
  credentials: true, // Cookies aur Auth headers ke liye ye zaroori hai
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));






// server.js ke andar
const leadRoutes = require("./routes/leadRoutes");
app.use("/api/leads", leadRoutes);



app.use("/api/auth", require("./routes/authRoutes"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);