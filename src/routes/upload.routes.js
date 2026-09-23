const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"),
  filename: (req, file, callback) => callback(null, `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => callback(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)),
});
const router = express.Router();

router.post("/image", requireAuth, requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Please choose a JPG, PNG, WEBP, or GIF image under 5 MB" });
  res.status(201).json({ url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`, filename: req.file.filename });
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) return res.status(400).json({ message: error.code === "LIMIT_FILE_SIZE" ? "Image must be no larger than 5 MB" : error.message });
  next(error);
});

module.exports = router;
