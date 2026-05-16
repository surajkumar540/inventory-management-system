import express from "express";
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  deleteConversation,
  deleteMessages,
} from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isStaff } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/",                               authMiddleware, isStaff, getMyConversations);
router.post("/messages/delete",               authMiddleware, isStaff, deleteMessages);      // must be before /:userId
router.delete("/conversation/:conversationId", authMiddleware, isStaff, deleteConversation);
router.get("/messages/:conversationId",       authMiddleware, isStaff, getMessages);
router.get("/:userId",                        authMiddleware, isStaff, getOrCreateConversation); // must be last

export default router;