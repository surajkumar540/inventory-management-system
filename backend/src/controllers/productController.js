import prisma from "../prisma/client.js";
import { createAuditLog } from "../utils/auditLogger.js";

const branchWhere = (req) => {
  const { role, branchId } = req.user;
  if (role === "SUPER_ADMIN") return {};
  if (branchId) return { branchId };
  return {};
};

export const createProduct = async (req, res) => {
  try {
    const { name, price, quantity, sku, threshold, categoryId } = req.body;

    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });
    if (!price)        return res.status(400).json({ success: false, message: "Price is required" });
    if (!sku?.trim())  return res.status(400).json({ success: false, message: "SKU is required" });

    const image = req.file
      ? `${req.protocol}://${req.get("host")}/${req.file.path}`
      : null;

    const assignedBranchId = req.user.role === "SUPER_ADMIN"
      ? (req.body.branchId ? Number(req.body.branchId) : null)
      : req.user.branchId;

    // check SKU unique per branch
    const existing = await prisma.product.findFirst({
      where: { sku, branchId: assignedBranchId },
    });
    if (existing)
      return res.status(409).json({ success: false, message: `SKU "${sku}" already exists in this branch` });

    const product = await prisma.product.create({
      data: {
        name, sku,
        price:      Number(price),
        quantity:   Number(quantity) || 0,
        threshold:  Number(threshold) || 10,
        categoryId: categoryId ? Number(categoryId) : null,
        branchId:   assignedBranchId,
        image,
      },
      include: {
        category: true,
        branch: { select: { id: true, name: true } },
      },
    });

    await createAuditLog(req, "PRODUCT_CREATED", "Product", product.id, {
      name: product.name, sku: product.sku,
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, categoryId, lowStock } = req.query;
    const where = { ...branchWhere(req) };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku:  { contains: search, mode: "insensitive" } },
      ];
    }
    if (categoryId) where.categoryId = Number(categoryId);

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        branch: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = products
      .map((p) => ({ ...p, isLowStock: p.quantity < p.threshold }))
      .filter((p) => lowStock === "true" ? p.isLowStock : true);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, threshold, categoryId, sku } = req.body;

    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });
    if (!price)        return res.status(400).json({ success: false, message: "Price is required" });

    const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!existing)
      return res.status(404).json({ success: false, message: "Product not found" });

    if (req.user.role !== "SUPER_ADMIN" && existing.branchId !== req.user.branchId)
      return res.status(403).json({ success: false, message: "Access denied" });

    // check SKU conflict if SKU is being changed
    if (sku && sku !== existing.sku) {
      const skuConflict = await prisma.product.findFirst({
        where: { sku, branchId: existing.branchId, NOT: { id: Number(id) } },
      });
      if (skuConflict)
        return res.status(409).json({ success: false, message: `SKU "${sku}" already exists in this branch` });
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...(name      && { name }),
        ...(price     && { price:     Number(price) }),
        ...(threshold && { threshold: Number(threshold) }),
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(sku       && { sku }),
      },
      include: {
        category: true,
        branch: { select: { id: true, name: true } },
      },
    });

    await createAuditLog(req, "PRODUCT_UPDATED", "Product", updated.id, {
      before: existing,
      after:  updated,
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!existing)
      return res.status(404).json({ success: false, message: "Product not found" });

    if (req.user.role !== "SUPER_ADMIN" && existing.branchId !== req.user.branchId)
      return res.status(403).json({ success: false, message: "Access denied" });

    await prisma.product.delete({ where: { id: Number(id) } });

    await createAuditLog(req, "PRODUCT_DELETED", "Product", id, { name: existing.name });

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};