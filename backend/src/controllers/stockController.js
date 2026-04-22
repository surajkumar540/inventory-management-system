// src/controllers/stockController.js
import prisma from "../prisma/client.js";
import { createAuditLog } from "../utils/auditLogger.js"; // ADD at top

// ========================
// STOCK IN — goods received
// ========================
export const stockIn = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;
    const userId = req.user.id;

    if (!productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "productId and quantity > 0 required",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const [updated] = await prisma.$transaction([
      prisma.product.update({
        where: { id: Number(productId) },
        data: { quantity: { increment: Number(quantity) } },
      }),
      prisma.stockLog.create({
        data: {
          productId: Number(productId),
          change: Number(quantity),
          reason: reason || "MANUAL_IN",
          userId,
        },
      }),
    ]);

    await createAuditLog(req, "STOCK_IN", "Stock", productId, {
      quantity,
      reason,
    });

    res.json({ success: true, message: "Stock added", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// STOCK OUT — goods dispatched
// ========================
export const stockOut = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;
    const userId = req.user.id;

    if (!productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "productId and quantity > 0 required",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} units available`,
      });
    }

    const [updated] = await prisma.$transaction([
      prisma.product.update({
        where: { id: Number(productId) },
        data: { quantity: { decrement: Number(quantity) } },
      }),
      prisma.stockLog.create({
        data: {
          productId: Number(productId),
          change: -Number(quantity),
          reason: reason || "MANUAL_OUT",
          userId,
        },
      }),
    ]);

    await createAuditLog(req, "STOCK_OUT", "Stock", productId, {
      quantity,
      reason,
    });

    res.json({ success: true, message: "Stock removed", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// GET STOCK LOGS
// ========================
export const getStockLogs = async (req, res) => {
  try {
    const { productId } = req.query;

    const logs = await prisma.stockLog.findMany({
      where: productId ? { productId: Number(productId) } : undefined,
      include: { product: { select: { name: true, sku: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
