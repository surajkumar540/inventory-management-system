import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Package, AlertTriangle } from "lucide-react";

import API from "../../api/axios";
import StatCard from "../../components/ui/StatCard";
import AlertBanner from "../../components/charts/AlertBanner";
import RevenueChart from "../../components/charts/RevenueChart";
import SalesChart from "../../components/charts/SalesChart";
import TopProductsChart from "../../components/charts/TopProductsChart"
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, salesRes, topRes] = await Promise.all([
          API.get("/dashboard"),
          API.get("/analytics/sales"),
          API.get("/analytics/top-products"),
        ]);
        setStats(dashRes.data.data);
        setSales(salesRes.data.data);
        setTopProducts(topRes.data.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-[20px] font-semibold text-gray-800">
          Inventory Overview
        </h1>
        <p className="text-[13px] text-gray-400 mt-1">
          Real-time metrics across products, orders, and revenue
        </p>
      </div>

      {/* Alert */}
      <AlertBanner products={stats?.lowStockProducts ?? []} />

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
          icon={DollarSign}
          color="indigo"
          trend={1}
          trendLabel="+100% from yesterday"
          progress={80}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="green"
          trend={1}
          trendLabel="1 order today"
          progress={40}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="amber"
          trend={0}
          trendLabel="No change"
          progress={20}
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockProducts.length}
          icon={AlertTriangle}
          color="red"
          trend={-1}
          trendLabel="Needs restocking"
          progress={60}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            title: "Revenue Trend",
            subtitle: "Daily · Apr 15–16",
            child: <RevenueChart data={sales} />,
          },
          {
            title: "Sales Volume",
            subtitle: "Orders per day",
            child: <SalesChart data={sales} />,
          },
        ].map(({ title, subtitle, child }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
          >
            <p className="text-[14px] font-semibold text-gray-700">{title}</p>
            <p className="text-[12px] text-gray-400 mb-4">{subtitle}</p>
            {child}
          </motion.div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
        >
          <p className="text-[14px] font-semibold text-gray-700 mb-1">
            Recent Orders
          </p>
          <p className="text-[12px] text-gray-400 mb-4">
            Last {stats.recentOrders.length} transactions
          </p>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[11px] text-gray-400 uppercase tracking-wider">
                <th className="text-left pb-3 font-medium">Order</th>
                <th className="text-left pb-3 font-medium">Date</th>
                <th className="text-right pb-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-gray-50">
                  <td className="py-2.5">
                    <p className="text-gray-700 font-medium">
                      #ORD-{String(order.id).padStart(3, "0")}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {order.items.length} item(s)
                    </p>
                  </td>
                  <td className="py-2.5 text-gray-400 font-mono text-[11px]">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold text-gray-700">
                    ₹{order.items
                      .reduce((s, i) => s + i.price * i.quantity, 0)
                      .toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
        >
          <p className="text-[14px] font-semibold text-gray-700 mb-1">
            Top Products
          </p>
          <p className="text-[12px] text-gray-400 mb-4">By units sold</p>
          <TopProductsChart data={topProducts} />
          <table className="w-full text-[13px] mt-4">
            <thead>
              <tr className="text-[11px] text-gray-400 uppercase tracking-wider">
                <th className="text-left pb-3 font-medium">Product</th>
                <th className="text-right pb-3 font-medium">Units</th>
                <th className="text-right pb-3 font-medium">Stock</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.productId} className="border-t border-gray-50">
                  <td className="py-2.5 text-gray-700 font-medium">{p.name}</td>
                  <td className="py-2.5 text-right font-mono text-gray-500">
                    {p.totalSold}
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                      Low
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;