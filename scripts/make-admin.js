require("dotenv").config();
const connectDB = require("../src/config/db");
const User = require("../src/models/user.model");

const email = process.argv[2]?.toLowerCase().trim();
if (!email) {
  console.error("Usage: npm run make-admin -- you@example.com");
  process.exit(1);
}

connectDB().then(async () => {
  const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
  if (!user) throw new Error("User not found");
  console.log(`${user.email} is now an admin`);
  process.exit(0);
}).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
