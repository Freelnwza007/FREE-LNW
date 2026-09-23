const express = require("express");
const multer = require("multer");
const path = require("path");
const { put } = require("@vercel/blob");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

const upload = multer({
  // Vercel functions have no persistent disk. Keep the request in memory only
  // long enough to send it to Blob.
  storage: multer.memoryStorage(),
  // Vercel Functions allow request bodies up to 4.5 MB; leave room for
  // multipart form-data overhead.
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, callback) => callback(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)),
});
const router = express.Router();

router.post("/image", requireAuth, requireAdmin, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Please choose a JPG, PNG, WEBP, or GIF image under 4 MB" });
    if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(500).json({ message: "Blob storage is not configured" });

    const extension = path.extname(req.file.originalname).toLowerCase();
    const safeBaseName = path.basename(req.file.originalname, extension)
      .replace(/[^a-z0-9_-]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "image";
    const blob = await put(`products/${safeBaseName}${extension}`, req.file.buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: req.file.mimetype,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    res.status(201).json({ url: blob.url, filename: blob.pathname });
  } catch (error) {
    next(error);
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) return res.status(400).json({ message: error.code === "LIMIT_FILE_SIZE" ? "Image must be no larger than 4 MB" : error.message });
  next(error);
});

module.exports = router;
