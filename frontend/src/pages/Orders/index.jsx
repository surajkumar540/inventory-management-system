import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, RefreshCw, Plus, X, Trash2,
  CheckCircle2, Clock, XCircle, ChevronRight,
} from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import { getProducts } from "../../api/product";
import api from "../../api/axios";

const STATUS_CONFIG = {
  PENDING:   { color: "bg-amber-50 text-amber-600 border-amber-100",   icon: Clock,        label: "Pending"   },
  COMPLETED: { color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle2, label: "Completed" },
  CANCELLED: { color: "bg-red-50 text-red-500 border-red-100",         icon: XCircle,      label: "Cancelled" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${cfg.color}`}>
      <cfg.icon size={9} /> {cfg.label}
    </span>
  );
};

// Create Order Modal
const CreateOrderModal = ({ onClose, onSuccess, products }) => {
  const [items, setItems]   = useState([{ productId: "", quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const addItem    = () => setItems([...items, { productId: "", quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === Number(item.productId));
    return sum + (product?.price || 0) * (Number(item.quantity) || 0);
  }, 0);

  const handleSubmit = async () => {
    setError("");
    const validItems = items.filter((i) => i.productId && Number(i.quantity) > 0);
    if (!validItems.length) return setError("Add at least one item");

    setLoading(true);
    try {
      await api.post("/orders", {
        items: validItems.map((i) => ({
          productId: Number(i.productId),
          quantity:  Number(i.quantity),
        })),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "h-10 px-3 text-[13px] text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all w-full";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <ShoppingCart size={14} className="text-white" />
            </div>
            <p className="text-[15px] font-bold text-slate-800">New Order</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
        </div>

        <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {items.map((item, i) => {
            const product = products.find((p) => p.id === Number(item.productId));
            return (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1">
                  {i === 0 && <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Product</label>}
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(i, "productId", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select product</option>
                    {products.filter((p) => p.quantity > 0).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{p.price} (stock: {p.quantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  {i === 0 && <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Qty</label>}
                  <input
                    type="number"
                    min="1"
                    max={product?.quantity || 999}
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", e.target.value)}
                    className={selectClass}
                  />
                </div>
                {items.length > 1 && (
                  <button onClick={() => removeItem(i)} className="h-10 w-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={addItem}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-violet-600 hover:text-violet-700 transition-colors"
          >
            <Plus size={13} /> Add item
          </button>
        </div>

        {error && <p className="px-6 text-xs text-red-500">{error}</p>}

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[13px] font-bold text-slate-700">
            Total: <span className="text-violet-600">₹{total.toLocaleString("en-IN")}</span>
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-all"
            >
              {loading ? "Placing…" : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const { user }              = useAuthStore();
  const [orders, setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const canSeeAll = ["SUPER_ADMIN", "ADMIN", "BRANCH_ADMIN"].includes(user?.role);

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const endpoint = canSeeAll ? "/orders" : "/orders/my";
      const res = await api.get(endpoint);
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Fetch products error:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    setCancellingId(id);
    try {
      await api.delete(`/orders/${id}`);
      fetchOrders(true);
    } catch (err) {
      console.error("Cancel error:", err);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 min-h-screen bg-slate-50/50">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-black text-slate-800 tracking-tight">Orders</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">{canSeeAll ? "All branch orders" : "Your order history"}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchOrders(true)}
            className="flex items-center gap-2 h-9 px-4 text-[12px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 h-9 px-4 text-[12px] font-semibold text-white bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl hover:from-violet-600 hover:to-indigo-700 shadow-sm shadow-violet-200 transition-all"
          >
            <Plus size={13} /> New Order
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <CreateOrderModal
          products={products}
          onClose={() => setShowModal(false)}
          onSuccess={() => { fetchOrders(true); fetchProducts(); }}
        />
      )}

      {/* Orders list */}
      {loading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl flex items-center justify-center h-52 gap-3">
          <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent animate-spin rounded-full" />
          <p className="text-[12px] text-slate-400">Loading orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center py-20 gap-3">
          <ShoppingCart size={36} className="text-slate-200" />
          <p className="text-[14px] font-semibold text-slate-400">No orders yet</p>
          <p className="text-[12px] text-slate-300">Click "New Order" to create one</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-[14px] font-bold text-slate-700">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/60">
                  {["Order", "Date", "Items", "Total", "Status", canSeeAll && "User", "Action"].filter(Boolean).map((h) => (
                    <th key={h} className="text-[10px] text-slate-400 font-bold uppercase tracking-widest py-3 px-4 text-left first:pl-6 last:text-right last:pr-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {orders.map((order, i) => {
                    const total = (order.items || []).reduce((s, item) => s + item.price * item.quantity, 0);
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="py-3 pl-6 pr-4">
                          <p className="text-[13px] font-bold text-slate-700">#ORD-{String(order.id).padStart(3, "0")}</p>
                        </td>
                        <td className="py-3 px-4 text-[12px] text-slate-400 font-mono">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5">
                            {(order.items || []).slice(0, 2).map((item) => (
                              <p key={item.id} className="text-[11px] text-slate-500">
                                {item.product?.name} × {item.quantity}
                              </p>
                            ))}
                            {order.items?.length > 2 && (
                              <p className="text-[11px] text-slate-400">+{order.items.length - 2} more</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[13px] font-black font-mono text-slate-800">
                            ₹{total.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={order.status} />
                        </td>
                        {canSeeAll && (
                          <td className="py-3 px-4 text-[12px] text-slate-500">
                            {order.user?.email || "—"}
                          </td>
                        )}
                        <td className="py-3 px-4 pr-6 text-right">
                          {order.status === "PENDING" && (
                            <button
                              onClick={() => handleCancel(order.id)}
                              disabled={cancellingId === order.id}
                              className="inline-flex items-center gap-1.5 h-7 px-3 text-[11px] font-semibold text-red-500 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-40"
                            >
                              {cancellingId === order.id
                                ? <div className="w-3 h-3 border-2 border-red-400 border-t-transparent animate-spin rounded-full" />
                                : <Trash2 size={11} />
                              }
                              Cancel
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Orders;