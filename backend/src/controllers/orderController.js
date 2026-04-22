// src/controllers/orderController.js
import prisma from "../prisma/client.js";

// ========================
// CREATE ORDER (Staff / Manager)
// ========================
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: { userId, status: "PENDING" },
      });

      for (const item of items) {
        if (!item.productId || item.quantity <= 0) {
          throw new Error("Invalid item: productId and quantity > 0 required");
        }

        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.quantity < item.quantity) {
          throw new Error(`Not enough stock for "${product.name}" (available: ${product.quantity})`);
        }

        await tx.orderItem.create({
          data: {
            orderId:   newOrder.id,
            productId: item.productId,
            quantity:  item.quantity,
            price:     product.price,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.stockLog.create({
          data: {
            productId: item.productId,
            change:    -item.quantity,
            reason:    "ORDER",
            userId,
          },
        });
      }

      return tx.order.findUnique({
        where: { id: newOrder.id },
        include: { items: { include: { product: true } } },
      });
    });

    res.status(201).json({ success: true, message: "Order created", data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========================
// GET ALL ORDERS (Admin / Manager)
// ========================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// GET MY ORDERS (Staff / all)
// ========================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// CANCEL ORDER — restores stock (Admin / Manager / own order)
// ========================
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Staff can only cancel their own orders
    if (userRole === "STAFF" && order.userId !== userId) {
      return res.status(403).json({ success: false, message: "Cannot cancel another user's order" });
    }

    if (order.status === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Order already cancelled" });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });

        await tx.stockLog.create({
          data: {
            productId: item.productId,
            change:    item.quantity,
            reason:    "ORDER",
            userId,
          },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data:  { status: "CANCELLED" },
      });
    });

    res.json({ success: true, message: "Order cancelled & stock restored" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};