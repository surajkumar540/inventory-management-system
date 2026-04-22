import express from "express";
import { register, login } from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js"; // ADD

const router = express.Router();

router.post("/register", authLimiter, register); // ADD authLimiter
router.post("/login", authLimiter, login);       // ADD authLimiter

export default router;