const mongoose = require("mongoose");
const crypto = require("crypto");

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "บ้าน" },
    fullAddress: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Passwords are stored as a salted scrypt hash, never as plain text.
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    addresses: [addressSchema],
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function comparePassword(password) {
  const [salt, storedHash] = this.password.split(":");
  if (!salt || !storedHash) return false;

  const derivedHash = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, hash) => {
      if (error) return reject(error);
      resolve(hash.toString("hex"));
    });
  });

  return crypto.timingSafeEqual(
    Buffer.from(storedHash, "hex"),
    Buffer.from(derivedHash, "hex")
  );
};

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await new Promise((resolve, reject) => {
    crypto.scrypt(this.password, salt, 64, (error, derivedKey) => {
      if (error) return reject(error);
      resolve(derivedKey.toString("hex"));
    });
  });
  this.password = `${salt}:${hash}`;
});

module.exports = mongoose.model("User", userSchema);
