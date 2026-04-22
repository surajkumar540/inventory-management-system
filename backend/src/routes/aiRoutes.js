// src/routes/aiRoutes.js
import express from "express";
import { getDemandPrediction } from "../controllers/aiController.js";
import { authMiddleware }      from "../middleware/authMiddleware.js";
import { isManager }           from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/predict", authMiddleware, isManager, getDemandPrediction);

export default router;