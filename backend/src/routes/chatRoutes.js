import express from "express";
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  deleteConversation,
} from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isStaff } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/",                          authMiddleware, isStaff, getMyConversations);
router.get("/:userId",                   authMiddleware, isStaff, getOrCreateConversation);
router.get("/messages/:conversationId",  authMiddleware, isStaff, getMessages);
router.delete("/:conversationId",        authMiddleware, isStaff, deleteConversation);

export default router;