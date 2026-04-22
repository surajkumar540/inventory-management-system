import express from "express";
import { getDemandPrediction } from "../controllers/aiController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isManager } from "../middleware/roleMiddleware.js";
import { aiLimiter } from "../middleware/rateLimitMiddleware.js"; // ADD

const router = express.Router();

router.get("/predict", authMiddleware, isManager, aiLimiter, getDemandPrediction); // ADD aiLimiter

export default router;