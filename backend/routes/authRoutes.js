const express = require("express");
const authMiddleware = require("../Middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  logoutUser,
  googleLogin,
  getMe,
  updateDetails,
  updatePassword,
  getAllUsers,
  deleteUser
} = require("../controllers/authController");

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/logout", logoutUser);

// Protected Routes (Login Required)
router.get("/me", authMiddleware, getMe);
router.put("/updatedetails", authMiddleware, updateDetails);
router.put("/updatepassword", authMiddleware, updatePassword);

// Admin Routes
router.get("/users", authMiddleware, getAllUsers);
router.delete("/users/:id", authMiddleware, deleteUser);

module.exports = router;