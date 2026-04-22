// src/controllers/dashboardController.js
import prisma from "../prisma/client.js";
import redis from "../utils/redis.js";

const CACHE_KEY = "dashboard:stats";
const CACHE_TTL = 60; // seconds

export const getDashboardStats = async (req, res) => {
  try {
    // Try Redis cache first
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return res.json({ success: true, fromCache: true, data: JSON.parse(cached) });
    }

    const [totalProducts, totalOrders, totalUsers, products, orders, recentOrders] =
      await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.user.count(),

        prisma.product.findMany({
          select: { id: true, name: true, quantity: true, threshold: true, price: true },
        }),

        prisma.order.findMany({
          where: { status: { not: "CANCELLED" } },
          include: { items: true },
        }),

        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            items: { include: { product: { select: { name: true } } } },
            user:  { select: { email: true, role: true } },
          },
        }),
      ]);

    const lowStockProducts = products.filter((p) => p.quantity < p.threshold);

    let totalRevenue = 0;
    orders.forEach((order) => {
      order.items.forEach((item) => {
        totalRevenue += item.quantity * item.price;
      });
    });

    const stats = {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentOrders,
    };

    // Cache it
    await redis.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(stats));

    res.json({ success: true, fromCache: false, data: stats });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
  }
};