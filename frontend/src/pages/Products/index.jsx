import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, RefreshCw } from "lucide-react";
import { getProducts } from "../../api/product";
import ProductTable from "../../components/products/ProductTable";
import ProductForm from "../../components/products/ProductForm";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

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
          <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">Products</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Manage your product inventory</p>
        </div>
        <button
          onClick={() => fetchProducts(true)}
          className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:border-indigo-200 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Add Form */}
      <ProductForm onSuccess={() => fetchProducts(true)} />

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-[12px] text-slate-400">Loading products…</p>
        </div>
      ) : (
        <ProductTable products={products} onRefresh={() => fetchProducts(true)} />
      )}
    </motion.div>
  );
};

export default Products;