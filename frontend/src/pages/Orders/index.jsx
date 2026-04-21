import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, RefreshCw } from "lucide-react";
import { getOrders, getMyOrders, deleteOrder } from "../../api/order";
import useAuthStore from "../../stores/useAuthStore";
import OrderForm from "../../components/orders/OrderForm";
import OrderTable from "../../components/orders/OrderTable";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = user?.role === "admin" ? await getOrders() : await getMyOrders();
      setOrders(res.data.data);
    } catch (err) {
      console.error("Fetch Orders Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await deleteOrder(id);
      fetchOrders(true);
    } catch (err) {
      console.error("Delete Order Error:", err);
    }
  };

  useEffect(() => { fetchOrders(); }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">Orders</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            {user?.role === "admin" ? "All customer orders" : "Your order history"}
          </p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:border-indigo-200 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* Create Order */}
      <OrderForm onSuccess={() => fetchOrders(true)} />

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-[12px] text-slate-400">Loading orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200/80 rounded-2xl">
          <ShoppingCart size={36} className="text-slate-200 mb-3" />
          <p className="text-[14px] font-medium text-slate-400">No orders yet</p>
          <p className="text-[12px] text-slate-300 mt-1">Create your first order above</p>
        </div>
      ) : (
        <OrderTable orders={orders} onDelete={handleDelete} />
      )}
    </motion.div>
  );
};

export default Orders;