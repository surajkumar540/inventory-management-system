import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  PackageSearch,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import API from "../../api/axios";

const fadeUp = {
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const ConfidenceBadge = ({ level }) => {
  const map = {
    HIGH: "bg-emerald-50 text-emerald-700 border-emerald-100",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-100",
    LOW: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${map[level] ?? map.LOW}`}
    >
      {level}
    </span>
  );
};

const UrgencyBadge = ({ level }) => {
  const map = {
    CRITICAL: "bg-red-50 text-red-600 border-red-100",
    HIGH: "bg-orange-50 text-orange-600 border-orange-100",
    MEDIUM: "bg-amber-50 text-amber-600 border-amber-100",
    LOW: "bg-slate-50 text-slate-500 border-slate-200",
  };
  const icons = {
    CRITICAL: <AlertTriangle size={10} />,
    HIGH: <AlertTriangle size={10} />,
    MEDIUM: <Clock size={10} />,
    LOW: <CheckCircle2 size={10} />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${map[level] ?? map.LOW}`}
    >
      {icons[level] ?? <CheckCircle2 size={10} />}
      {level}
    </span>
  );
};

const AI = () => {
  const [result, setResult] = useState(null); // full API response
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── Destructure safely ───────────────────────────────────────────────────

  const aiAnalysis = result?.data?.aiAnalysis ?? null;
  const predictions = aiAnalysis?.predictions ?? [];
  const salesSummary = result?.data?.salesSummary ?? [];
  const restockRecommendations = aiAnalysis?.restockRecommendations ?? [];
  const alerts = aiAnalysis?.alerts ?? [];

  console.log("pre", predictions);
  console.log("sales", salesSummary);
  console.log("restock", restockRecommendations);
  console.log("alerts", alerts);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/ai/predict");
      setResult(res.data); // store full response
      console.log("API RESULT:", res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get AI prediction");
    } finally {
      setLoading(false);
    }
  };

  console.log("RESULT STATE:", result);

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
          <h1 className="text-[22px] font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-500" />
            AI Demand Prediction
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            AI analyzes past 30 days of sales to predict future demand
          </p>
        </div>
        <button
          onClick={fetchPrediction}
          disabled={loading}
          className="flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          {loading ? "Analyzing…" : "Run AI Analysis"}
        </button>
      </motion.div>

      {/* Info Banner — only before first run */}
      {!result && !loading && (
        <motion.div
          variants={fadeUp}
          className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow shadow-indigo-200 shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-indigo-800 mb-1">
              How it works
            </p>
            <div className="space-y-1.5">
              {[
                "Fetches last 30 days of sales data from your inventory",
                "Sends data to AI for intelligent analysis",
                "Returns demand predictions + restock recommendations",
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-[12px] text-indigo-600"
                >
                  <ChevronRight
                    size={11}
                    className="text-indigo-400 shrink-0"
                  />
                  {step}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-indigo-400 mt-3">
              Click "Run AI Analysis" to generate predictions
            </p>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-200/80 rounded-2xl p-12 flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Sparkles size={22} className="text-white animate-pulse" />
              </div>
              <div className="absolute -inset-1 rounded-2xl border-2 border-indigo-300/40 animate-ping" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-semibold text-slate-700">
                AI is analyzing your data…
              </p>
              <p className="text-[12px] text-slate-400 mt-1">
                This may take a few seconds
              </p>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[13px] font-medium"
          >
            <AlertTriangle size={15} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Alerts */}
            {alerts.length > 0 && (
              <motion.div variants={fadeUp} className="space-y-2">
                <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider px-1">
                  AI Alerts
                </p>
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-[13px] text-amber-700"
                  >
                    <AlertTriangle
                      size={14}
                      className="shrink-0 mt-0.5 text-amber-500"
                    />
                    <span>
                      <span className="font-bold">{alert.type}</span> —{" "}
                      {alert.message}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Predictions + Restock */}
            <div className="grid grid-cols-2 gap-4">
              {/* Demand Predictions */}
              <motion.div
                variants={fadeUp}
                className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow shadow-indigo-200">
                    <TrendingUp size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-slate-700">
                      Demand Predictions
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Next 30 days forecast
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {predictions.length === 0 ? (
                    <p className="px-6 py-8 text-[12px] text-slate-300 text-center">
                      No predictions available
                    </p>
                  ) : (
                    predictions.map((p, i) => (
                      <motion.div
                        key={p.productId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors"
                      >
                        <div>
                          <p className="text-[13px] font-semibold text-slate-700">
                            {p.productName}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Predicted demand:{" "}
                            <span className="font-bold text-indigo-600">
                              {p.predictedDemand} units
                            </span>
                          </p>
                          {p.recommendation && (
                            <p className="text-[11px] text-slate-400 mt-0.5 italic">
                              {p.recommendation}
                            </p>
                          )}
                        </div>
                        <ConfidenceBadge level={p.confidence} />
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Restock Recommendations */}
              <motion.div
                variants={fadeUp}
                className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow shadow-emerald-200">
                    <PackageSearch size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-slate-700">
                      Restock Recommendations
                    </p>
                    <p className="text-[11px] text-slate-400">
                      AI suggested quantities
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {restockRecommendations.length === 0 ? (
                    <p className="px-6 py-8 text-[12px] text-slate-300 text-center">
                      No restock needed
                    </p>
                  ) : (
                    restockRecommendations.map((r, i) => (
                      <motion.div
                        key={r.productId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors"
                      >
                        <div>
                          <p className="text-[13px] font-semibold text-slate-700">
                            {r.productName}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Current:{" "}
                            <span className="font-bold text-slate-600">
                              {r.currentStock}
                            </span>
                            {" · "}Order{" "}
                            <span className="font-bold text-emerald-600">
                              {r.suggestedRestockQty} units{" "}
                              {/* ✅ correct field name */}
                            </span>
                          </p>
                        </div>
                        <UrgencyBadge level={r.urgency} />
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sales Summary Table */}
            <motion.div
              variants={fadeUp}
              className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <p className="text-[14px] font-semibold text-slate-700">
                    Sales Summary (Last 30 Days)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Data used for AI analysis
                  </p>
                </div>
                <button
                  onClick={fetchPrediction}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 bg-white border px-3 py-1.5 rounded-xl hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                >
                  <RefreshCw size={11} /> Refresh
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/70">
                      {["Product", "Current Stock", "Sold (30d)", "Status"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest py-3 px-6 text-left"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {salesSummary.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-[12px] text-slate-300"
                        >
                          No data available
                        </td>
                      </tr>
                    ) : (
                      salesSummary.map((p, i) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="py-3.5 px-6 text-[13px] font-semibold text-slate-700">
                            {p.name}
                          </td>
                          <td className="py-3.5 px-6 text-[13px] font-mono text-slate-600">
                            {p.currentStock}
                          </td>
                          <td className="py-3.5 px-6 text-[13px] font-mono font-bold text-indigo-600">
                            {p.soldLast30Days}
                          </td>
                          <td className="py-3.5 px-6">
                            {p.currentStock < p.threshold ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 uppercase tracking-wide">
                                <AlertTriangle size={9} /> Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                                <CheckCircle2 size={9} /> OK
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AI;
