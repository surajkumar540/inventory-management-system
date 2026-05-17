import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, ArrowDown, ArrowUp, RefreshCw } from "lucide-react";
import api from "../../api/axios";
import { getProducts } from "../../api/product";

const Stock = () => {
  const [form, setForm]       = useState({ productId: "", quantity: "", reason: "" });
  const [products, setProducts] = useState([]);
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await api.get("/stock/logs");
      setLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchLogs();
  }, []);

  const handleStock = async (type) => {
    if (!form.productId) return setMessage({ type: "error", text: "Select a product" });
    if (!form.quantity || Number(form.quantity) <= 0) return setMessage({ type: "error", text: "Enter valid quantity" });

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
      fetchLogs();
      fetchProducts();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed" });
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === Number(form.productId));

  const inputClass = "h-10 px-3 text-[13px] text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all w-full";
  const labelClass = "text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 min-h-screen bg-slate-50/50">

      <div>
        <h1 className="text-[24px] font-black text-slate-800">Stock Management</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Record goods received or dispatched</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Stock Entry Form */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
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
              <label className={labelClass}>Product</label>
              <select
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                className={inputClass}
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.sku} (stock: {p.quantity})
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400">Current stock:</span>
                <span className={`text-[12px] font-bold ${selectedProduct.quantity <= selectedProduct.threshold ? "text-red-500" : "text-emerald-600"}`}>
                  {selectedProduct.quantity} units
                </span>
              </div>
            )}

            <div>
              <label className={labelClass}>Quantity</label>
              <input
                type="number"
                min="1"
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

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => handleStock("in")}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 h-10 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-semibold rounded-xl transition disabled:opacity-50"
              >
                <ArrowDown size={14} /> Stock IN
              </button>
              <button
                onClick={() => handleStock("out")}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 h-10 bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold rounded-xl transition disabled:opacity-50"
              >
                <ArrowUp size={14} /> Stock OUT
              </button>
            </div>
          </div>
        </div>

        {/* Stock Logs */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <p className="text-[14px] font-bold text-slate-700">Stock Logs</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Recent stock movements</p>
            </div>
            <button
              onClick={fetchLogs}
              className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:border-indigo-200 hover:text-indigo-500 transition-all"
            >
              <RefreshCw size={11} /> Refresh
            </button>
          </div>

          {logsLoading ? (
            <div className="flex items-center justify-center h-40 gap-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
              <p className="text-[12px] text-slate-400">Loading logs…</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <ArrowDownUp size={28} className="text-slate-200" />
              <p className="text-[13px] text-slate-400">No stock movements yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/60">
                    {["Product", "SKU", "Change", "Reason", "Date"].map((h) => (
                      <th key={h} className="text-[10px] text-slate-400 font-bold uppercase tracking-widest py-3 px-4 text-left first:pl-6">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 pl-6 pr-4 text-[13px] font-semibold text-slate-700">
                        {log.product?.name || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {log.product?.sku || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[12px] font-bold ${log.change > 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {log.change > 0 ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                          {log.change > 0 ? `+${log.change}` : log.change}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {log.reason}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Stock;