import express from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isBranchAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/",       authMiddleware, isBranchAdmin, getUsers);
router.post("/",      authMiddleware, isBranchAdmin, createUser);
router.put("/:id",    authMiddleware, isBranchAdmin, updateUser);
router.delete("/:id", authMiddleware, isBranchAdmin, deleteUser);

export default router;