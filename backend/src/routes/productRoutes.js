import express from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js"; // 👈 ADD THIS

const router = express.Router();

// 👤 All users can view
router.get("/", authMiddleware, getProducts);

// 👑 Only admin can modify + upload image
router.post(
  "/",
  authMiddleware,
  isAdmin,
  upload.single("image"),   // 👈 THIS IS MISSING
  createProduct
);

router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

export default router;