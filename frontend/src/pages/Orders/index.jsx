import { useEffect, useState } from "react";
import { getOrders, getMyOrders, deleteOrder } from "../../api/order";
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

      if (user?.role === "admin") {
        res = await getOrders(); // admin
      } else {
        res = await getMyOrders(); // user
      }

      setOrders(res.data.data);
    } catch (err) {
      console.error("Fetch Orders Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE / CANCEL ORDER
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Cancel this order?");

    if (!confirmDelete) return;

    try {
      await deleteOrder(id);
      fetchOrders();
    } catch (err) {
      console.error("Delete Order Error:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

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
        <p className="text-center text-gray-400 py-10">
          No orders found
        </p>
      ) : (
        <OrderTable orders={orders} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default Orders;