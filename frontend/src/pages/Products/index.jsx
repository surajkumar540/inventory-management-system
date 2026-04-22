import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { getProducts } from "../../api/product";
import ProductTable from "../../components/products/ProductTable";
import ProductForm from "../../components/products/ProductForm";
import useAuthStore from "../../stores/useAuthStore"; // ✅ ADD

const Products = () => {
  const { user } = useAuthStore(); // ✅ FIRST

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isManager = ["ADMIN", "MANAGER"].includes(user?.role);

  const fetchProducts = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await getProducts();
      setProducts(res?.data?.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const isAdmin = user?.role === "admin"; // ✅ ADD

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800">Products</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Manage your product inventory
          </p>
        </div>

        <button
          onClick={() => fetchProducts(true)}
          className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 bg-white border px-3 py-2 rounded-xl"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ✅ SHOW FORM ONLY FOR ADMIN */}
      {isManager && <ProductForm onSuccess={() => fetchProducts(true)} />}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center h-40 items-center">
          <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
        </div>
      ) : (
        <ProductTable
          products={products}
          onRefresh={() => fetchProducts(true)}
          isAdmin={isManager} // ✅ PASS
        />
      )}
    </motion.div>
  );
};

export default Products;
