import { useEffect, useState } from "react";
import API from "../api/axios";
import Card from "../components/Card";
import SalesChart from "../components/charts/SalesChart";
import RevenueChart from "../components/charts/RevenueChart";
import TopProductsChart from "../components/charts/TopProductsChart";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const dashboard = await API.get("/dashboard");
      const salesRes = await API.get("/analytics/sales");
      const topRes = await API.get("/analytics/top-products");

      setStats(dashboard.data.data);
      setSales(salesRes.data.data);
      setTopProducts(topRes.data.data);
    };

    fetchData();
  }, []);

  if (!stats) return <p className="p-5">Loading...</p>;

  return (
    <div className="p-5 space-y-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card title="Total Products" value={stats.totalProducts} />
        <Card title="Total Orders" value={stats.totalOrders} />
        <Card title="Total Revenue" value={`₹${stats.totalRevenue}`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="mb-2 font-semibold">Sales</h2>
          <SalesChart data={sales} />
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="mb-2 font-semibold">Revenue</h2>
          <RevenueChart data={sales} />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="mb-2 font-semibold">Top Products</h2>
        <TopProductsChart data={topProducts} />
      </div>
    </div>
  );
};

export default Dashboard;