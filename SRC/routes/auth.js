const express = require("express");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const router = express.Router();
const User = require("../models/user");
const { validateRegistration } = require("../middleware/validators");
const { generateToken, setAuthCookie, clearAuthCookie } = require("../services/tokenService");


router.post("/web-register", validateRegistration, async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user_id = crypto.createHash("sha256").update(email).digest("hex");

    const newUser = new User({
      user_id,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profilePic: profilePic || "",
      role,
      createdAt: new Date()
    });

    await newUser.save();
    const token = generateToken(newUser);

    res.status(201).json({
      message: "Registered successfully",
      token
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcryptjs.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.json({
      message: "Login successful",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        likedPosts: user.likedPosts,
        profilePic: user.profilePic || "",
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/verify", require("../middleware/auth").authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ status: "unauthorized" });

    res.json({
      status: "authorized",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        likedPosts: user.likedPosts,
        profilePic: user.profilePic || "",
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ status: "error" });
  }
});


router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
});

module.exports = router;