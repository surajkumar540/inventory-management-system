import prisma from "../prisma/client.js";// ===============================
// DASHBOARD CONTROLLER
// ===============================

export const getDashboardStats = async (req, res) => {
  try {
    // =========================
    // PARALLEL QUERIES (OPTIMIZED)
    // =========================
    const [
      totalProducts,
      totalOrders,
      products,
      orders,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count(),

      prisma.order.count(),

      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          quantity: true,
          threshold: true,
          price: true,
        },
      }),

      prisma.order.findMany({
        include: {
          items: true,
        },
      }),

      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          items: true,
        },
      }),
    ]);

    // =========================
    // LOW STOCK PRODUCTS
    // =========================
    const lowStockProducts = products.filter(
      (p) => p.quantity < p.threshold
    );

    // =========================
    // TOTAL REVENUE CALCULATION
    // =========================
    let totalRevenue = 0;

    orders.forEach((order) => {
      order.items.forEach((item) => {
        totalRevenue += item.quantity * item.price;
      });
    });

    // =========================
    // RESPONSE
    // =========================
    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalRevenue,
        lowStockProducts,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};