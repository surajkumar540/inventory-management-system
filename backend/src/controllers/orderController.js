import prisma from "../prisma/client.js";

const branchWhere = (req) => {
  const { role, branchId } = req.user;
  if (role === "SUPER_ADMIN" || role === "ADMIN") return {};
  if (branchId) return { user: { branchId } };
  return {};
};

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!items?.length)
      return res.status(400).json({ success: false, message: "No items in order" });

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: { userId, status: "PENDING" },
      });

      for (const item of items) {
        if (!item.productId || item.quantity <= 0)
          throw new Error("Invalid item: productId and quantity > 0 required");

        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);

        // BRANCH_ADMIN / STAFF can only order from their branch products
        if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN") {
          if (product.branchId !== req.user.branchId)
            throw new Error(`Product "${product.name}" not available in your branch`);
        }

        if (product.quantity < item.quantity)
          throw new Error(`Not enough stock for "${product.name}" (available: ${product.quantity})`);

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
          data:  { quantity: { decrement: item.quantity } },
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

export const getAllOrders = async (req, res) => {
  try {
    const where = {};

    if (req.user.role === "BRANCH_ADMIN" || req.user.role === "STAFF") {
      where.user = { branchId: req.user.branchId };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        user:  { select: { id: true, email: true, role: true, branch: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

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

export const cancelOrder = async (req, res) => {
  try {
    const { id }     = req.params;
    const userId     = req.user.id;
    const userRole   = req.user.role;

    const order = await prisma.order.findUnique({
      where:   { id: Number(id) },
      include: { items: true, user: true },
    });

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    // STAFF can only cancel own orders
    if (userRole === "STAFF" && order.userId !== userId)
      return res.status(403).json({ success: false, message: "Cannot cancel another user's order" });

    // BRANCH_ADMIN can only cancel orders within their branch
    if (userRole === "BRANCH_ADMIN" && order.user.branchId !== req.user.branchId)
      return res.status(403).json({ success: false, message: "Cannot cancel order from another branch" });

    if (order.status === "CANCELLED")
      return res.status(400).json({ success: false, message: "Order already cancelled" });

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data:  { quantity: { increment: item.quantity } },
        });
        await tx.stockLog.create({
          data: {
            productId: item.productId,
            change:    item.quantity,
            reason:    "ORDER_CANCEL",
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