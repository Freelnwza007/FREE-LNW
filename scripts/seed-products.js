require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Product = require("../src/models/product.model");

const image = {
  coffee: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=1000&q=90",
  latte: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=90",
  iced: "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=1000&q=90",
  beans: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1000&q=90",
  bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=90",
  cookie: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1000&q=90",
  milk: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=1000&q=90",
  tea: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1000&q=90",
};

const entries = [
  ["Free Lnw House Blend", "coffee", "เอสเปรสโซเบลนด์คั่วกลางเข้ม บอดี้นุ่ม กลิ่นช็อกโกแลตและคาราเมล", 120, "COF-001", "coffee", { roastLevel: "Medium-Dark", process: "Natural", origin: "Thailand" }],
  ["Chiang Rai Single Origin", "coffee", "อาราบิก้าคั่วกลางจากเชียงราย โทนส้มหวาน ช็อกโกแลต และอัลมอนด์", 150, "COF-002", "beans", { roastLevel: "Medium", process: "Washed", origin: "Chiang Rai, Thailand" }],
  ["Americano", "coffee", "เอสเปรสโซเต็มรสชาติ ดื่มง่ายได้ทั้งร้อนและเย็น", 90, "COF-003", "coffee", { roastLevel: "Medium-Dark", process: "Natural", origin: "Thailand" }],
  ["Cappuccino", "coffee", "เอสเปรสโซกับโฟมนมเนียนละเอียด หอมละมุนทุกคำ", 115, "COF-004", "latte", { roastLevel: "Medium", process: "Washed", origin: "Thailand" }],
  ["Dirty Coffee", "coffee", "นมเย็นจัดรับเอสเปรสโซร้อน รสเข้มและนุ่มในแก้วเดียว", 130, "COF-005", "latte", { roastLevel: "Medium-Dark", process: "Natural", origin: "Thailand" }],
  ["Cold Brew", "coffee", "กาแฟสกัดเย็น 18 ชั่วโมง รสนุ่มหวาน ปลายสะอาด", 120, "COF-006", "iced", { roastLevel: "Medium", process: "Washed", origin: "Thailand" }],
  ["Iced Orange Espresso", "coffee", "เอสเปรสโซเข้มข้นกับน้ำส้มสด หอม สดชื่น ดื่มง่าย", 135, "COF-007", "iced", { roastLevel: "Medium", process: "Natural", origin: "Thailand" }],
  ["Oat Milk Latte", "coffee", "ลาเต้นมโอ๊ตรสละมุน โฟมนุ่ม หวานธรรมชาติ", 145, "COF-008", "latte", { roastLevel: "Medium", process: "Washed", origin: "Thailand" }],
  ["Butter Croissant", "bakery", "ครัวซองต์เนยสด อบใหม่ทุกเช้า กรอบนอก นุ่มใน", 85, "BAK-001", "bakery"],
  ["Chocolate Cookie", "bakery", "คุกกี้ช็อกโกแลตชิพเนื้อหนึบ หวานพอดี", 65, "BAK-002", "cookie"],
  ["Fresh Milk", "milk", "นมสดเย็นรสนุ่ม ดื่มเดี่ยว ๆ หรือเพิ่มความละมุนให้กาแฟ", 75, "MLK-001", "milk"],
  ["Peach Tea Sparkling", "refresher", "ชาพีชหอมหวานซ่าพอดี สำหรับวันที่อยากพักจากกาแฟ", 95, "RFR-001", "tea"],
];

const products = entries.map(([name, productType, description, price, sku, photo, coffeeDetails]) => ({
  name, productType, description, images: [image[photo]], coffeeDetails,
  variants: [{ sku, size: "Regular", price, stock: 30 }],
  grindOptions: productType === "coffee" ? ["None", "Espresso", "Filter"] : ["None"],
  isActive: true,
}));

connectDB().then(async () => {
  await Product.updateOne({ name: "Port Able House Blend" }, { $set: { name: "Free Lnw House Blend" } });
  const operations = products.map((product) => ({ updateOne: { filter: { name: product.name }, update: { $set: product }, upsert: true } }));
  const result = await Product.bulkWrite(operations);
  console.log(`Seeded ${products.length} products (inserted: ${result.upsertedCount}, updated: ${result.modifiedCount})`);
  await mongoose.disconnect();
}).catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
