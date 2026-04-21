import { useEffect, useState } from "react";
import { getOrders, getMyOrders } from "../../api/order";
import useAuthStore from "../../stores/useAuthStore";

import OrderForm from "../../components/orders/OrderForm";
import OrderTable from "../../components/orders/OrderTable";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();

  // =========================
  // FETCH ORDERS
  // =========================
  const fetchOrders = async () => {
    try {
      setLoading(true);

      let res;

      // 👑 Admin → all orders
      if (user?.role === "admin") {
        res = await getOrders();
      }
      // 👤 User → only my orders
      else {
        res = await getMyOrders();
      }

      setOrders(res.data.data);
    } catch (err) {
      console.error("Fetch Orders Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchOrders();
  }, [user]);

  // =========================
  // UI
  // =========================
  return (
    <div className="space-y-6">
      {/* Create Order */}
      <OrderForm onSuccess={fetchOrders} />

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        // Empty State
        <p className="text-center text-gray-400 py-10">No orders found</p>
      ) : (
        // Orders Table
        <OrderTable orders={orders} />
      )}
    </div>
  );
};

export default Orders;
