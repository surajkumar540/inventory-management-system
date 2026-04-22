import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Package, AlertTriangle, ArrowUpRight } from "lucide-react";

import API from "../../api/axios";
import StatCard from "../../components/ui/StatCard";
import AlertBanner from "../../components/charts/AlertBanner";
import RevenueChart from "../../components/charts/RevenueChart";
import SalesChart from "../../components/charts/SalesChart";
import TopProductsChart from "../../components/charts/TopProductsChart";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Dashboard = () => {
  const [stats, setStats]           = useState(null);
  const [sales, setSales]           = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading]       = useState(true);

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
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-[12px] text-slate-400">Fetching dashboard data…</p>
      </div>
    );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4 sm:space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-[18px] sm:text-[22px] font-bold text-slate-800 tracking-tight">
            Inventory Overview
          </h1>
          <p className="text-[12px] sm:text-[13px] text-slate-400 mt-0.5">
            Real-time metrics across products, orders &amp; revenue
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live data
        </div>
      </motion.div>

      {/* Alert */}
      <motion.div variants={fadeUp}>
        <AlertBanner products={stats?.lowStockProducts ?? []} />
      </motion.div>

      {/* Stat Cards — 2 cols on mobile, 4 on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}`}
          icon={DollarSign}
          color="indigo"
          trend={1}
          trendLabel="+100% from yesterday"
          progress={80}
          delay={0.05}
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders ?? 0}
          icon={ShoppingCart}
          color="green"
          trend={1}
          trendLabel="1 order today"
          progress={40}
          delay={0.1}
        />
        <StatCard
          title="Products"
          value={stats?.totalProducts ?? 0}
          icon={Package}
          color="amber"
          trend={0}
          trendLabel="No change"
          progress={20}
          delay={0.15}
        />
        <StatCard
          title="Low Stock"
          value={stats?.lowStockProducts?.length ?? 0}
          icon={AlertTriangle}
          color="red"
          trend={-1}
          trendLabel="Needs restocking"
          progress={60}
          delay={0.2}
        />
      </div>

      {/* Charts Row — 1 col mobile, 2 col md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {[
          { title: "Revenue Trend",  subtitle: "Daily revenue — last 7 days", child: <RevenueChart data={sales} /> },
          { title: "Sales Volume",   subtitle: "Orders per day",              child: <SalesChart data={sales} /> },
        ].map(({ title, subtitle, child }) => (
          <motion.div
            key={title}
            variants={fadeUp}
            className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-[13px] sm:text-[14px] font-semibold text-slate-700">{title}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
              </div>
              <button className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 hover:border-indigo-200 transition-colors shrink-0">
                <ArrowUpRight size={13} />
              </button>
            </div>
            <div className="mt-3 sm:mt-4">{child}</div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Row — 1 col mobile, 2 col md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

        {/* Recent Orders */}
        <motion.div variants={fadeUp} className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-[13px] sm:text-[14px] font-semibold text-slate-700">Recent Orders</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                Last {stats?.recentOrders?.length ?? 0} transactions
              </p>
            </div>
            <span className="text-[11px] font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full cursor-pointer hover:bg-indigo-100 transition-colors shrink-0">
              View all
            </span>
          </div>

          <div className="overflow-x-auto mt-3 sm:mt-4">
            <table className="w-full min-w-[280px]">
              <thead>
                <tr>
                  {["Order", "Date", "Amount"].map((h) => (
                    <th key={h} className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest pb-3 text-left last:text-right">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3 pr-2">
                      <p className="text-[12px] sm:text-[13px] text-slate-700 font-semibold">
                        #ORD-{String(order.id).padStart(3, "0")}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-400">{order.items?.length ?? 0} item(s)</p>
                    </td>
                    <td className="py-3 text-[11px] sm:text-[12px] text-slate-400 font-mono">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-[12px] sm:text-[13px] font-bold font-mono text-slate-700">
                        ₹{(order.items ?? []).reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString("en-IN")}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div variants={fadeUp} className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-[13px] sm:text-[14px] font-semibold text-slate-700">Top Products</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">By units sold</p>
            </div>
            <span className="text-[11px] font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full cursor-pointer hover:bg-indigo-100 transition-colors shrink-0">
              View all
            </span>
          </div>

          <div className="mt-3 sm:mt-4">
            <TopProductsChart data={topProducts} />
          </div>

          <div className="overflow-x-auto mt-3 sm:mt-4">
            <table className="w-full min-w-[280px]">
              <thead>
                <tr>
                  {["Product", "Units", "Stock"].map((h) => (
                    <th key={h} className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest pb-3 text-left last:text-right">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <motion.tr
                    key={p.productId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3 text-[12px] sm:text-[13px] text-slate-700 font-medium truncate max-w-[120px]">
                      {p.name}
                    </td>
                    <td className="py-3 text-[12px] sm:text-[13px] font-mono font-semibold text-slate-600">
                      {p.totalSold}
                    </td>
                    <td className="py-3 text-right">
                      {p.isLowStock ? (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 uppercase tracking-wide">
                          Low
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                          OK
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Dashboard;