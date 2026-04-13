const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



// ✅ REGISTER
// ✅ REGISTER
exports.register = async (req, res) => {
  try {

    const { email, password } = req.body;

    // ✅ DEFINE REGEX HERE (IMPORTANT)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

    // ✅ Validate email
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }
    const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com"];

const domain = email.split("@")[1];

if (!allowedDomains.includes(domain)) {
  return res.status(400).json({
    message: "Only valid email providers like Gmail, Yahoo, Outlook are allowed"
  });
}

    // ✅ Validate password
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must contain uppercase letter and number"
      });
    }

    // ✅ Normalize email
    const normalizedEmail = email.toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check if user exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email: normalizedEmail,
      password: hashed
    });

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: { email: user.email }
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Register failed" });
  }
};
// ✅ LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({  email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: { email: user.email }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};