import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Package, DollarSign,
  ShoppingCart, ArrowUpRight, BarChart2
} from "lucide-react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement, BarElement, ArcElement,
  CategoryScale, LinearScale, PointElement,
  Tooltip, Filler, Legend
} from "chart.js";
import API from "../../api/axios";
import { chartDefaults, colors } from "../../styles/tokens";

ChartJS.register(
  LineElement, BarElement, ArcElement,
  CategoryScale, LinearScale, PointElement,
  Tooltip, Filler, Legend
);

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// ========================
// STAT CARD
// ========================
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorMap = {
    indigo: "from-indigo-500 to-violet-500 shadow-indigo-200",
    green:  "from-emerald-500 to-teal-500 shadow-emerald-200",
    amber:  "from-amber-500 to-orange-400 shadow-amber-200",
    red:    "from-red-500 to-rose-400 shadow-red-200",
  };
  const bgMap = {
    indigo: "bg-indigo-50 border-indigo-100",
    green:  "bg-emerald-50 border-emerald-100",
    amber:  "bg-amber-50 border-amber-100",
    red:    "bg-red-50 border-red-100",
  };

  return (
    <motion.div
      variants={fadeUp}
      className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
          <Icon size={16} className="text-white" />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${bgMap[color]}`}>
          {subtitle}
        </span>
      </div>
      <p className="text-[24px] font-bold text-slate-800 tracking-tight">{value}</p>
      <p className="text-[12px] text-slate-400 mt-0.5">{title}</p>
    </motion.div>
  );
};

// ========================
// MAIN PAGE
// ========================
const Analytics = () => {
  const [sales, setSales]           = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [salesRes, topRes] = await Promise.all([
          API.get("/analytics/sales"),
          API.get("/analytics/top-products"),
        ]);
        setSales(salesRes.data.data || []);
        setTopProducts(topRes.data.data || []);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Derived stats ──────────────────────────────
  const totalRevenue  = sales.reduce((s, d) => s + d.totalRevenue, 0);
  const totalOrders   = sales.reduce((s, d) => s + d.totalSales, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const bestDay       = sales.reduce(
    (best, d) => (d.totalRevenue > (best?.totalRevenue ?? 0) ? d : best),
    null
  );

  // ── Chart labels ──────────────────────────────
  const labels = sales.map((d) =>
    new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric", month: "short",
    })
  );

  // ── Revenue Line Chart ────────────────────────
  const revenueData = {
    labels,
    datasets: [{
      label: "Revenue (₹)",
      data: sales.map((d) => d.totalRevenue),
      borderColor: colors.primary,
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
        g.addColorStop(0, "rgba(99,102,241,0.2)");
        g.addColorStop(1, "rgba(99,102,241,0)");
        return g;
      },
      fill: true,
      tension: 0.45,
      borderWidth: 2,
      pointBackgroundColor: "#fff",
      pointBorderColor: colors.primary,
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  // ── Orders Bar Chart ──────────────────────────
  const ordersData = {
    labels,
    datasets: [{
      label: "Orders",
      data: sales.map((d) => d.totalSales),
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 180);
        g.addColorStop(0, "rgba(99,102,241,0.75)");
        g.addColorStop(1, "rgba(139,92,246,0.3)");
        return g;
      },
      borderColor: "transparent",
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  // ── Top Products Horizontal Bar ───────────────
  const topProductsData = {
    labels: topProducts.map((p) => p.name),
    datasets: [{
      label: "Units Sold",
      data: topProducts.map((p) => p.totalSold),
      backgroundColor: [
        "rgba(99,102,241,0.8)",
        "rgba(139,92,246,0.7)",
        "rgba(16,185,129,0.7)",
        "rgba(245,158,11,0.7)",
        "rgba(239,68,68,0.7)",
      ],
      borderColor: "transparent",
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  // ── Doughnut — revenue split ──────────────────
  const doughnutData = {
    labels: topProducts.map((p) => p.name),
    datasets: [{
      data: topProducts.map((p) => p.totalSold),
      backgroundColor: [
        "rgba(99,102,241,0.85)",
        "rgba(139,92,246,0.75)",
        "rgba(16,185,129,0.75)",
        "rgba(245,158,11,0.75)",
        "rgba(239,68,68,0.75)",
      ],
      borderColor: "#fff",
      borderWidth: 3,
      hoverOffset: 6,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          color: "#94a3b8",
          font: { size: 11 },
          boxWidth: 10,
          padding: 12,
        },
      },
      tooltip: chartDefaults.plugins.tooltip,
    },
    cutout: "70%",
  };

  const yRevenue = {
    ...chartDefaults.scales.y,
    ticks: {
      ...chartDefaults.scales.y.ticks,
      callback: (v) => `₹${v >= 1000 ? v / 1000 + "K" : v}`,
    },
  };

  // ── Empty state helper ─────────────────────────
  const EmptyChart = ({ height = "h-52" }) => (
    <div className={`${height} flex flex-col items-center justify-center gap-2`}>
      <BarChart2 size={28} className="text-slate-200" />
      <p className="text-[12px] text-slate-300">No data yet — create some orders first</p>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      <p className="text-[12px] text-slate-400">Loading analytics…</p>
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">Analytics</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Sales performance — last 7 days
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 font-semibold bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
          <TrendingUp size={11} />
          Live analytics
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={DollarSign}
          color="indigo"
          subtitle="Revenue"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
          color="green"
          subtitle="Orders"
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${Math.round(avgOrderValue).toLocaleString("en-IN")}`}
          icon={TrendingUp}
          color="amber"
          subtitle="Avg"
        />
        <StatCard
          title="Best Day Revenue"
          value={bestDay ? `₹${bestDay.totalRevenue.toLocaleString("en-IN")}` : "—"}
          icon={Package}
          color="red"
          subtitle={bestDay
            ? new Date(bestDay.date + "T00:00:00").toLocaleDateString("en-IN", {
                day: "numeric", month: "short"
              })
            : "No data"
          }
        />
      </div>

      {/* Revenue + Orders Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Revenue Trend */}
        <motion.div
          variants={fadeUp}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[14px] font-semibold text-slate-700">Revenue Trend</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Daily revenue — last 7 days</p>
            </div>
            <ArrowUpRight size={14} className="text-slate-300" />
          </div>
          {sales.every((d) => d.totalRevenue === 0)
            ? <EmptyChart />
            : (
              <div className="h-52">
                <Line
                  data={revenueData}
                  options={{
                    ...chartDefaults,
                    scales: { x: chartDefaults.scales.x, y: yRevenue },
                  }}
                />
              </div>
            )
          }
        </motion.div>

        {/* Orders Volume */}
        <motion.div
          variants={fadeUp}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[14px] font-semibold text-slate-700">Orders Volume</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Orders per day — last 7 days</p>
            </div>
            <ArrowUpRight size={14} className="text-slate-300" />
          </div>
          {sales.every((d) => d.totalSales === 0)
            ? <EmptyChart />
            : (
              <div className="h-52">
                <Bar
                  data={ordersData}
                  options={{
                    ...chartDefaults,
                    scales: {
                      x: chartDefaults.scales.x,
                      y: {
                        ...chartDefaults.scales.y,
                        ticks: { ...chartDefaults.scales.y.ticks, stepSize: 1 },
                      },
                    },
                  }}
                />
              </div>
            )
          }
        </motion.div>
      </div>

      {/* Top Products + Doughnut */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top Products Bar */}
        <motion.div
          variants={fadeUp}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm"
        >
          <div className="mb-4">
            <p className="text-[14px] font-semibold text-slate-700">Top Products</p>
            <p className="text-[11px] text-slate-400 mt-0.5">By units sold</p>
          </div>
          {topProducts.length === 0
            ? <EmptyChart height="h-44" />
            : (
              <div className="h-44">
                <Bar
                  data={topProductsData}
                  options={{
                    ...chartDefaults,
                    indexAxis: "y",
                    scales: {
                      x: chartDefaults.scales.x,
                      y: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { color: "#94a3b8", font: { size: 11 } },
                      },
                    },
                  }}
                />
              </div>
            )
          }
        </motion.div>

        {/* Doughnut */}
        <motion.div
          variants={fadeUp}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm"
        >
          <div className="mb-4">
            <p className="text-[14px] font-semibold text-slate-700">Sales Distribution</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Share by product</p>
          </div>
          {topProducts.length === 0
            ? <EmptyChart height="h-44" />
            : (
              <div className="h-44">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            )
          }
        </motion.div>
      </div>

      {/* Sales Table */}
      <motion.div
        variants={fadeUp}
        className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-[14px] font-semibold text-slate-700">Daily Breakdown</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Revenue and orders per day</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/70">
                {["Date", "Orders", "Revenue", "Avg Order"].map((h) => (
                  <th key={h} className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest py-3 px-6 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[12px] text-slate-300">
                    No sales data yet
                  </td>
                </tr>
              ) : (
                [...sales].reverse().map((d, i) => (
                  <motion.tr
                    key={d.date}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3.5 px-6 text-[13px] font-medium text-slate-700">
                      {new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", {
                        weekday: "short", day: "numeric", month: "short"
                      })}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-[13px] font-semibold text-slate-600">
                        {d.totalSales}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-[13px] font-bold font-mono text-slate-700">
                        ₹{d.totalRevenue.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-[13px] font-mono text-slate-500">
                        ₹{d.totalSales > 0
                          ? Math.round(d.totalRevenue / d.totalSales).toLocaleString("en-IN")
                          : 0}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;