import express from "express";
import {
  createOrder,
  getAllOrders,
  getMyOrders
} from "../controllers/orderController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// 👤 user order
router.post("/", authMiddleware, createOrder);
router.get("/my", authMiddleware, getMyOrders);

// 👑 admin orders
router.get("/", authMiddleware, isAdmin, getAllOrders);

export default router;