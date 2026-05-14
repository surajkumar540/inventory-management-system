import express from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isSuperAdmin, isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/",       authMiddleware, isAdmin,      getUsers);
router.post("/",      authMiddleware, isSuperAdmin, createUser);
router.put("/:id",    authMiddleware, isSuperAdmin, updateUser);
router.delete("/:id", authMiddleware, isSuperAdmin, deleteUser);

export default router;