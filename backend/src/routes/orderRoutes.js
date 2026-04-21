import express from "express";
import {
  cancelOrder,
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
router.delete("/:id", authMiddleware, cancelOrder);
// 👑 admin orders
router.get("/", authMiddleware, isAdmin, getAllOrders);

export default router;