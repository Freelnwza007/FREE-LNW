const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const coffeeDetailsSchema = new mongoose.Schema(
  {
    roastLevel: {
      type: String,
      enum: ["Light", "Medium-Light", "Medium", "Medium-Dark", "Dark", "Custom"],
      default: "Medium",
    },
    process: {
      type: String,
      enum: ["Washed", "Natural", "Honey", "Experimental", "Other"],
      default: "Washed",
    },
    origin: { type: String, trim: true },
  },
  { _id: false }
);

const teaDetailsSchema = new mongoose.Schema(
  {
    teaType: {
      type: String,
      enum: ["Matcha", "Green Tea", "Black Tea", "Thai Tea", "Hojicha", "Oolong", "Herbal", "Other"],
      default: "Green Tea",
    },
    grade: {
      type: String,
      enum: ["Ceremonial", "Premium", "Culinary", "Commercial", "Standard"],
      default: "Premium",
    },
    origin: { type: String, trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    productType: {
      type: String,
      enum: ["coffee", "tea", "accessory", "bakery", "milk", "refresher", "COFFEE", "MILK COFFEE", "BAKERY", "MILK", "REFRESHER"],
      required: true,
    },
    images: [{ type: String, trim: true }],
    coffeeDetails: { type: coffeeDetailsSchema },
    teaDetails: { type: teaDetailsSchema },
    variants: { type: [variantSchema], required: true, validate: [(value) => value.length > 0, "At least one variant is required"] },
    grindOptions: [
      {
        type: String,
        enum: ["None", "Whole Bean", "Espresso", "Filter", "French Press", "Cold Brew", "Moka Pot"],
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
