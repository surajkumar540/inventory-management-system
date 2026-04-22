import express from "express";
import {
  getSalesAnalytics,
  getTopProducts,
} from "../controllers/analyticsController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/sales", authMiddleware, isAdmin, getSalesAnalytics);
router.get("/top-products", authMiddleware, isAdmin, getTopProducts);

export default router;
