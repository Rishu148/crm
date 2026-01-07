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

app.use(cors());
app.use(express.json());



app.get("/check", (req, res) => {
  res.send("API working");
});

app.use("/api/tasks", require("./routes/taskRoutes"));



app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173", // frontend
  credentials: true,               // IMPORTANT
})
);


// app.use(cors({
//   origin: "http://localhost:5173"
// }));




app.use("/api/deals", require("./routes/dealRoutes"));

app.use("/api/taskManagement", require("./routes/taskManagementRoutes"));

app.use("/api/auth", require("./routes/authRoutes"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);