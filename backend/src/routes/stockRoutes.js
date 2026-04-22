// src/routes/stockRoutes.js
import express from "express";
import { stockIn, stockOut, getStockLogs }
  from "../controllers/stockController.js";
import { authMiddleware }     from "../middleware/authMiddleware.js";
import { isManager, isStaff } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/in",   authMiddleware, isStaff,   stockIn);
router.post("/out",  authMiddleware, isStaff,   stockOut);
router.get("/logs",  authMiddleware, isManager, getStockLogs);

export default router;