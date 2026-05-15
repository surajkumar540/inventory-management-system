import express from "express";
import { createBranch, getBranches, updateBranch, deleteBranch } from "../controllers/branchController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isSuperAdmin, isBranchAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/",       authMiddleware, isBranchAdmin, getBranches);
router.post("/",      authMiddleware, isSuperAdmin,  createBranch);
router.put("/:id",    authMiddleware, isSuperAdmin,  updateBranch);
router.delete("/:id", authMiddleware, isSuperAdmin,  deleteBranch);

export default router;