const User = require("../models/user.model");
const { verifyToken } = require("../utils/token");

const requireAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";
    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) return res.status(401).json({ message: "Authentication is required" });

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "User no longer exists" });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access is required" });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };
