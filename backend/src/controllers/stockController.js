import prisma from "../prisma/client.js";
import { createAuditLog } from "../utils/auditLogger.js";

// scope helper — BRANCH_ADMIN and STAFF only see their branch products
const getBranchProduct = async (productId, req) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
  });
  if (!product) return { error: "Product not found", status: 404 };

  if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN") {
    if (product.branchId !== req.user.branchId)
      return { error: "Product not in your branch", status: 403 };
  }

  return { product };
};

export const stockIn = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;
    const userId = req.user.id;

    if (!productId || Number(quantity) <= 0)
      return res.status(400).json({ success: false, message: "productId and quantity > 0 required" });

    const { product, error, status } = await getBranchProduct(productId, req);
    if (error) return res.status(status).json({ success: false, message: error });

    const [updated] = await prisma.$transaction([
      prisma.product.update({
        where: { id: Number(productId) },
        data:  { quantity: { increment: Number(quantity) } },
      }),
      prisma.stockLog.create({
        data: {
          productId: Number(productId),
          change:    Number(quantity),
          reason:    reason || "MANUAL_IN",
          userId,
        },
      }),
    ]);

    await createAuditLog(req, "STOCK_IN", "Stock", productId, { quantity, reason });

    res.json({ success: true, message: "Stock added", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const stockOut = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;
    const userId = req.user.id;

    if (!productId || Number(quantity) <= 0)
      return res.status(400).json({ success: false, message: "productId and quantity > 0 required" });

    const { product, error, status } = await getBranchProduct(productId, req);
    if (error) return res.status(status).json({ success: false, message: error });

    if (product.quantity < Number(quantity))
      return res.status(400).json({ success: false, message: `Only ${product.quantity} units available` });

    const [updated] = await prisma.$transaction([
      prisma.product.update({
        where: { id: Number(productId) },
        data:  { quantity: { decrement: Number(quantity) } },
      }),
      prisma.stockLog.create({
        data: {
          productId: Number(productId),
          change:    -Number(quantity),
          reason:    reason || "MANUAL_OUT",
          userId,
        },
      }),
    ]);

    await createAuditLog(req, "STOCK_OUT", "Stock", productId, { quantity, reason });

    res.json({ success: true, message: "Stock removed", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStockLogs = async (req, res) => {
  try {
    const { productId } = req.query;
    const where = {};

    // scope by branch — only show logs for products in their branch
    if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN") {
      where.product = { branchId: req.user.branchId };
    }

    if (productId) where.productId = Number(productId);

    const logs = await prisma.stockLog.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true, branchId: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};