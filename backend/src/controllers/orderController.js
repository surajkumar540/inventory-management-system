import prisma from "../prisma/client.js";

// =======================
// CREATE ORDER (PRO VERSION)
// =======================
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in order",
      });
    }

    // =========================
    // TRANSACTION
    // =========================
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: { userId },
      });

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error("Product not found");
        }

        if (product.quantity < item.quantity) {
          throw new Error(`Not enough stock for ${product.name}`);
        }

        // Create order item
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          },
        });

        // Update stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: product.quantity - item.quantity,
          },
        });

        // Stock log
        await tx.stockLog.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
          },
        });
      }

      return newOrder;
    });

    // =========================
    // 🔥 CLEAR REDIS CACHE
    // =========================
    await redisClient.del("dashboard");

    // =========================
    // RESPONSE
    // =========================
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });

  } catch (err) {
    console.error("Order Error:", err.message);

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// GET ALL ORDERS (ADMIN)
// =======================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    console.error("Get Orders Error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// GET MY ORDERS (USER)
// =======================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    console.error("My Orders Error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};