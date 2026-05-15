import express from "express";
import { createProduct, getProducts, updateProduct, deleteProduct } from "../controllers/productController.js";
import { authMiddleware }  from "../middleware/authMiddleware.js";
import { isBranchAdmin, isStaff } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/",       authMiddleware, isStaff,       getProducts);
router.post("/",      authMiddleware, isBranchAdmin, upload.single("image"), createProduct);
router.put("/:id",    authMiddleware, isBranchAdmin, updateProduct);
router.delete("/:id", authMiddleware, isBranchAdmin, deleteProduct);

export default router;