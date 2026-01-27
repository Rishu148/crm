const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library"); // 👇 Google Auth Import

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- HELPER: Token Generator ---
const sendToken = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000, // 1 Day
  });

  res.status(statusCode).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    },
  });
};

// 1. REGISTER
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword, role: "user" });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 2. LOGIN
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.password && user.googleAuth) {
        return res.status(400).json({ message: "Please login with Google" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 3. GOOGLE LOGIN (New Feature)
exports.googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, picture } = ticket.getPayload();

        let user = await User.findOne({ email });
        if (user) {
            sendToken(user, 200, res);
        } else {
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: "user",
                avatar: picture,
                googleAuth: true,
            });
            sendToken(user, 201, res);
        }
    } catch (error) {
        res.status(400).json({ message: "Google Login Failed" });
    }
};

// 4. LOGOUT
exports.logoutUser = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

// 5. GET CURRENT USER
exports.getMe = (req, res) => {
  res.status(200).json({ user: req.user });
};

// --- SETTINGS PAGE FUNCTIONS ---

// 6. UPDATE PROFILE
exports.updateDetails = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      const updatedUser = await user.save();
      // Updated data wapis bhejo taaki frontend refresh ho sake
      res.json({
         id: updatedUser._id,
         name: updatedUser.name,
         email: updatedUser.email,
         role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// 7. CHANGE PASSWORD
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    if(user.googleAuth && !user.password) {
        return res.status(400).json({ message: "Google users cannot change password" });
    }

    if (user && (await bcrypt.compare(currentPassword, user.password))) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();
      res.json({ message: "Password updated" });
    } else {
      res.status(401).json({ message: "Incorrect current password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 8. GET ALL USERS (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 9. DELETE USER (Admin)
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};