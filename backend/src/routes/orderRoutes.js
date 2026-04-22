// src/routes/orderRoutes.js
import express from "express";
import { createOrder, getAllOrders, getMyOrders, cancelOrder }
  from "../controllers/orderController.js";
import { authMiddleware }     from "../middleware/authMiddleware.js";
import { isManager, isStaff } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/",    authMiddleware, isStaff,   createOrder);
router.get("/my",   authMiddleware, isStaff,   getMyOrders);
router.delete("/:id", authMiddleware, isStaff, cancelOrder);
router.get("/",     authMiddleware, isManager, getAllOrders);

export default router;