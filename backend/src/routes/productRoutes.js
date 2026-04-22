// src/routes/productRoutes.js
import express from "express";
import {
  createProduct, getProducts, updateProduct, deleteProduct,
} from "../controllers/productController.js";
import { authMiddleware }       from "../middleware/authMiddleware.js";
import { isManager, isStaff }   from "../middleware/roleMiddleware.js";
import { upload }               from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/",     authMiddleware, isStaff,   getProducts);
router.post("/",    authMiddleware, isManager, upload.single("image"), createProduct);
router.put("/:id",  authMiddleware, isManager, updateProduct);
router.delete("/:id", authMiddleware, isManager, deleteProduct);

export default router;