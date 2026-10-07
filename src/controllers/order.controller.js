const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Product = require("../models/product.model");

const field = (id, value) => `${id}${String(value.length).padStart(2, "0")}${value}`;
const crc16 = (value) => {
  let crc = 0xffff;
  for (const byte of Buffer.from(value, "utf8")) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
};

const promptPayPayload = (recipient, amount) => {
  const digits = recipient.replace(/\D/g, "");
  const isPhone = digits.length === 10 && digits.startsWith("0");
  const isNationalId = digits.length === 13;
  if (!isPhone && !isNationalId) throw new Error("PROMPTPAY_ID must be a 10-digit phone or 13-digit national ID");
  const proxy = isPhone ? `0066${digits.slice(1)}` : digits;
  const merchant = field("00", "A000000677010111") + field(isPhone ? "01" : "02", proxy);
  const amountField = field("54", amount.toFixed(2));
  const payload = field("00", "01") + field("01", "12") + field("29", merchant) + field("53", "764") + amountField + field("58", "TH") + "6304";
  return `${payload}${crc16(payload)}`;
};

exports.createOrder = async (req, res, next) => {
  try {
    const recipient = process.env.PROMPTPAY_ID;
    if (!recipient) return res.status(503).json({ message: "ร้านค้ายังไม่ได้ตั้งค่า PROMPTPAY_ID" });
    const { items, shippingAddress } = req.body;
    const name = String(shippingAddress?.name || "").trim();
    const phone = String(shippingAddress?.phone || "").trim();
    const fullAddress = String(shippingAddress?.fullAddress || "").trim();
    if (!name || !/^0\d{9}$/.test(phone) || fullAddress.length < 8) {
      return res.status(400).json({ message: "กรุณากรอกชื่อ เบอร์โทรศัพท์ และที่อยู่ให้ครบถ้วน" });
    }
    if (!Array.isArray(items) || !items.length || items.length > 50) {
      return res.status(400).json({ message: "ไม่พบสินค้าในคำสั่งซื้อ" });
    }
    const normalized = items.map((item) => ({ id: String(item.key || ""), quantity: Number(item.quantity) }));
    if (normalized.some((item) => !mongoose.isValidObjectId(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) {
      return res.status(400).json({ message: "รายการสินค้าไม่ถูกต้อง กรุณาลองใหม่" });
    }
    const products = await Product.find({ _id: { $in: normalized.map((item) => item.id) }, isActive: true });
    if (products.length !== normalized.length) return res.status(400).json({ message: "มีสินค้าบางรายการที่ไม่มีจำหน่ายแล้ว กรุณาตรวจสอบตะกร้า" });
    const productMap = new Map(products.map((product) => [String(product._id), product]));
    const orderItems = normalized.map(({ id, quantity }) => {
      const product = productMap.get(id);
      const variant = product.variants[0];
      return { product: product._id, name: product.name, sku: variant.sku, size: variant.size, price: variant.price, quantity };
    });
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const payload = promptPayPayload(recipient, total);
    const order = await Order.create({
      orderNumber: `FL-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      items: orderItems,
      shippingAddress: { name, phone, fullAddress },
      summary: { subtotal: total, shippingFee: 0, discount: 0, total },
      paymentMethod: "promptpay",
    });
    res.status(201).json({ orderNumber: order.orderNumber, total, promptPayPayload: payload });
  } catch (error) {
    if (error.message.startsWith("PROMPTPAY_ID")) return res.status(500).json({ message: error.message });
    next(error);
  }
};
