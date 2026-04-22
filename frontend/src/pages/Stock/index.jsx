// pages/Stock.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, ArrowDown, ArrowUp } from "lucide-react";
import api from "../../api/axios";

const Stock = () => {
  const [form, setForm]     = useState({ productId: "", quantity: "", reason: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleStock = async (type) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post(`/stock/${type}`, {
        productId: Number(form.productId),
        quantity:  Number(form.quantity),
        reason:    form.reason || undefined,
      });
      setMessage({ type: "success", text: res.data.message });
      setForm({ productId: "", quantity: "", reason: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-10 px-3 text-[13px] text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all placeholder:text-slate-300 w-full";
  const labelClass = "text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-slate-800">Stock Management</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Record goods received or dispatched</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <ArrowDownUp size={14} className="text-white" />
          </div>
          <p className="text-[14px] font-semibold text-slate-700">Stock Entry</p>
        </div>

        {message && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-[13px] font-medium border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-red-50 text-red-600 border-red-100"
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Product ID</label>
            <input
              type="number"
              placeholder="Enter product ID"
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Quantity</label>
            <input
              type="number"
              placeholder="Enter quantity"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Reason (optional)</label>
            <input
              type="text"
              placeholder="e.g. New shipment received"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleStock("in")}
              disabled={loading || !form.productId || !form.quantity}
              className="flex-1 flex items-center justify-center gap-2 h-10 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-semibold rounded-xl transition disabled:opacity-50"
            >
              <ArrowDown size={14} /> Stock IN
            </button>
            <button
              onClick={() => handleStock("out")}
              disabled={loading || !form.productId || !form.quantity}
              className="flex-1 flex items-center justify-center gap-2 h-10 bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold rounded-xl transition disabled:opacity-50"
            >
              <ArrowUp size={14} /> Stock OUT
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Stock;