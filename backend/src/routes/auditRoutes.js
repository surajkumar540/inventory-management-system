import express from "express";
import { getAuditLogs } from "../controllers/auditController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getAuditLogs);

export default router;