const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // 🔥 Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    // 🔥 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");

    // 🔥 Ensure consistent user object everywhere
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    req.user = {
      _id: decoded.id
    };

    next();

  } catch (error) {
    console.error("AUTH ERROR:", error);

    return res.status(401).json({
      message: "Authentication failed. Invalid or expired token."
    });
  }
};