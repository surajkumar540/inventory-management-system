// server.js
import "dotenv/config";
import express from "express";
import cors    from "cors";
import morgan  from "morgan";
import helmet  from "helmet";

import authRoutes      from "./src/routes/authRoutes.js";
import productRoutes   from "./src/routes/productRoutes.js";
import orderRoutes     from "./src/routes/orderRoutes.js";
import stockRoutes     from "./src/routes/stockRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import analyticsRoutes from "./src/routes/analyticsRoutes.js";
import aiRoutes        from "./src/routes/aiRoutes.js";
import auditRoutes from "./src/routes/auditRoutes.js";

import { globalLimiter } from "./src/middleware/rateLimitMiddleware.js";

const app = express();

// ========================
// MIDDLEWARE
// ========================
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use(globalLimiter);
// ========================
// ROUTES
// ========================
app.use("/api/auth",      authRoutes);
app.use("/api/products",  productRoutes);
app.use("/api/orders",    orderRoutes);
app.use("/api/stock",     stockRoutes);       // NEW
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai",        aiRoutes);          // NEW
app.use("/api/audit",     auditRoutes);       // NEW

app.get("/", (req, res) => res.send("Inventory API 🚀"));

// ========================
// GLOBAL ERROR HANDLER
// ========================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));