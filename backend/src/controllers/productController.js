// src/controllers/productController.js
import prisma from "../prisma/client.js";
import { createAuditLog } from "../utils/auditLogger.js"; // ADD at top

// ========================
// CREATE PRODUCT (Manager)
// ========================
export const createProduct = async (req, res) => {
  try {
    const { name, price, quantity, sku, threshold, categoryId } = req.body;

    const image = req.file
      ? `${req.protocol}://${req.get("host")}/${req.file.path}`
      : null;

    const product = await prisma.product.create({
      data: {
        name,
        sku: sku || `SKU-${Date.now()}`,
        price: Number(price),
        quantity: Number(quantity) || 0,
        threshold: Number(threshold) || 10,
        categoryId: categoryId ? Number(categoryId) : null,
        image,
      },
      include: { category: true },
    });

    await createAuditLog(req, "PRODUCT_CREATED", "Product", product.id, {
      name: product.name,
      sku: product.sku,
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// GET ALL PRODUCTS (All roles)
// ========================
export const getProducts = async (req, res) => {
  try {
    const { search, categoryId, lowStock } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }
    if (categoryId) where.categoryId = Number(categoryId);
    if (lowStock === "true") {
      where.quantity = { lt: prisma.product.fields.threshold };
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    // Flag low stock in response
    const data = products.map((p) => ({
      ...p,
      isLowStock: p.quantity < p.threshold,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// UPDATE PRODUCT (Manager)
// ========================
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, threshold, categoryId, sku } = req.body;

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(price && { price: Number(price) }),
        ...(threshold && { threshold: Number(threshold) }),
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(sku && { sku }),
      },
      include: { category: true },
    });

    await createAuditLog(req, "PRODUCT_UPDATED", "Product", updated.id, {
      before: existingProduct,
      after: updated,
    });

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// DELETE PRODUCT (Manager)
// ========================
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({ where: { id: Number(id) } });

    await createAuditLog(req, "ORDER_CANCELLED", "Order", id);

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
