const User = require("../models/user.model");
const { createToken } = require("../utils/token");

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const respondWithAuth = (res, user, status = 200) => {
  const token = createToken({ sub: user._id.toString(), role: user.role });
  return res.status(status).json({ token, user: publicUser(user) });
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (!isValidEmail(normalizedEmail)) return res.status(400).json({ message: "Please provide a valid email" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

    const exists = await User.exists({ email: normalizedEmail });
    if (exists) return res.status(409).json({ message: "This email is already registered" });

    const user = await User.create({ name: normalizedName, email: normalizedEmail, password, phone });
    return respondWithAuth(res, user, 201);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "This email is already registered" });
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }
    return respondWithAuth(res, user);
  } catch (error) {
    next(error);
  }
};

const getMe = (req, res) => res.json({ user: publicUser(req.user) });

module.exports = { register, login, getMe };
