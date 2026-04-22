import prisma from "../prisma/client.js";

// =======================
// SALES + REVENUE PER DAY
// =======================
export const getSalesAnalytics = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      include: { items: true },
    });

    // Build last 7 days as base (so chart always shows something)
    const dataMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dataMap[key] = { date: key, totalSales: 0, totalRevenue: 0 };
    }

    // Fill in real data
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!dataMap[date]) {
        dataMap[date] = { date, totalSales: 0, totalRevenue: 0 };
      }
      dataMap[date].totalSales += 1;
      order.items.forEach((item) => {
        dataMap[date].totalRevenue += item.quantity * item.price;
      });
    });

    const result = Object.values(dataMap).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};

// =======================
// TOP SELLING PRODUCTS
// =======================
export const getTopProducts = async (req, res) => {
  try {
    const result = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const productIds = result.map((r) => r.productId);

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    const finalData = result.map((r) => {
      const product = products.find((p) => p.id === r.productId);

      return {
        productId: r.productId,
        name: product?.name,
        totalSold: r._sum.quantity,
      };
    });

    res.json({
      success: true,
      data: finalData,
    });
  } catch (err) {
    console.error("Top Products Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch top products",
    });
  }
};
