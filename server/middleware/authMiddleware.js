// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = "your_very_strong_secret_key_here_123456789"; // same as auth.js

module.exports = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      // Check token existence
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      // Extract token
      const token = authHeader.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Fetch user
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // ✅ FIX: include user.name
      req.user = {
        id: user._id,
        role: user.role,
        name: user.name,
      };

      // Role check (if provided)
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res
          .status(403)
          .json({ message: "Access denied: insufficient permissions" });
      }

      next();
    } catch (err) {
      console.error("Auth error:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
