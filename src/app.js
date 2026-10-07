const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const uploadRoutes = require("./routes/upload.routes");
const orderRoutes = require("./routes/order.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/orders", orderRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
