import express from "express";
import { register, login, verifyOTP, verifyLoginOTP, resendOTP } from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.post("/register",          authLimiter, register);
router.post("/verify-otp",        authLimiter, verifyOTP);
router.post("/login",             authLimiter, login);
router.post("/verify-login-otp",  authLimiter, verifyLoginOTP);
router.post("/resend-otp",        authLimiter, resendOTP);

export default router;