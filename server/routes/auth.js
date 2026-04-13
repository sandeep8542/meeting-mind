const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");
const auth = require("../middleware/auth");
const User = require("../models/User");

// ✅ REGISTER
router.post("/register", register);

// ✅ LOGIN
router.post("/login", login);

// ✅ GET CURRENT USER (🔥 THIS WAS MISSING)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });

  } catch (error) {
    console.error("ME ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;