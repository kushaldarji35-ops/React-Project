import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authroutes from "./routes/authRoutes.js";
import adminroutes from "./routes/adminroutes.js";
import customerroutes from "./routes/customerRoutes.js";
import addressroutes from "./routes/addressRoutes.js";
import categoryroutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import productroutes from "./routes/productRoutes.js";
import cartroutes from "./routes/cartRoutes.js";
import orderroutes from "./routes/orderRoutes.js";
import orderItemroutes from "./routes/orderItemRoutes.js";
import reviewroutes from "./routes/reviewRoutes.js";
import couponroutes from "./routes/couponRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/auth", authroutes);
app.use("/api/admin", adminroutes);
app.use("/api/customer", customerroutes);
app.use("/api/address", addressroutes);
app.use("/api/categories", categoryroutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/products", productroutes);
app.use("/api/cart", cartroutes);
app.use("/api/orders", orderroutes);
app.use("/api/order", orderroutes);
app.use("/api/order-items", orderItemroutes);
app.use("/api/reviews", reviewroutes);
app.use("/api/coupons", couponroutes);

// Home API
app.get("/", (req, res) => {
  res.json({
    message: "Backend API is Running...",
    endpoints: [
      "/api/auth",
      "/api/admin",
      "/api/customer",
      "/api/address",
      "/api/categories",
      "/api/subcategories",
      "/api/products",
      "/api/cart",
      "/api/orders",
      "/api/order-items",
      "/api/reviews",
      "/api/coupons"
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});