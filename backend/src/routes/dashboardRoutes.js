// src/routes/dashboardRoutes.js
import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { authMiddleware }    from "../middleware/authMiddleware.js";
import { isManager }         from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, isManager, getDashboardStats);

export default router;