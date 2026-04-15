import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// =======================
// CREATE ORDER
// =======================
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // 1️⃣ Check stock first
    for (let item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`
        });
      }
    }

    // 2️⃣ Create Order + Items
    const order = await prisma.order.create({
      data: {
        userId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: true
      }
    });

    // 3️⃣ Reduce stock
    for (let item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      });

      // optional: stock log
      await prisma.stockLog.create({
        data: {
          productId: item.productId,
          change: -item.quantity
        }
      });
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
            product: true
          }
        },
        user: true
      }
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================
// GET MY ORDERS (USER)
// =======================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};