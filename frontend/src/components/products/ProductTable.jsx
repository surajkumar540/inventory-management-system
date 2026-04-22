import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { deleteProduct } from "../../api/product";
import { Trash2, Package, Search } from "lucide-react";

const ProductTable = ({ products, onRefresh, isManager }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const safeProducts = Array.isArray(products) ? products : [];

  const filtered = safeProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const getStockBadge = (qty) => {
    if (qty === 0)
      return (
        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 uppercase tracking-wide">
          Out of stock
        </span>
      );
    if (qty <= 10)
      return (
        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wide">
          Low · {qty}
        </span>
      );
    return (
      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
        In stock · {qty}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
            <Package size={14} className="text-slate-500" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-slate-700">
              All Products
            </p>
            <p className="text-[11px] text-slate-400">
              {products.length} item{products.length !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-52 group focus-within:border-indigo-300 focus-within:bg-indigo-50/30 transition-all">
          <Search
            size={12}
            className="text-slate-400 group-focus-within:text-indigo-400 transition-colors shrink-0"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="flex-1 bg-transparent text-[12px] text-slate-600 placeholder:text-slate-300 outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-300">
          <Package size={36} className="mb-3 opacity-40" />
          <p className="text-[14px] font-medium text-slate-400">
            {search ? "No products match your search" : "No products yet"}
          </p>
          <p className="text-[12px] text-slate-300 mt-1">
            {search
              ? "Try a different keyword"
              : "Add your first product above"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/70">
                <th className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest pb-3 pt-3 text-left px-6">
                  Image
                </th>
                <th className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest pb-3 pt-3 text-left px-3">
                  Name
                </th>
                <th className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest pb-3 pt-3 text-left px-3">
                  SKU
                </th>
                <th className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest pb-3 pt-3 text-left px-3">
                  Price
                </th>
                <th className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest pb-3 pt-3 text-left px-3">
                  Stock
                </th>
                {isManager && (
                  <th className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest pb-3 pt-3 text-right px-6">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Image */}
                    <td className="py-3.5 px-6">
                      {p.image ? (
                        <img
                          src={encodeURI(p.image?.replace(/\\/g, "/"))}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-xl border border-slate-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                          <Package size={14} className="text-slate-300" />
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-3">
                      <p className="text-[13px] font-semibold text-slate-700">
                        {p.name}
                      </p>
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-3">
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {p.sku || "—"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-3">
                      <span className="text-[13px] font-bold font-mono text-slate-700">
                        ₹{p.price?.toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-3">{getStockBadge(p.quantity)}</td>

                    {/* Delete */}
                    {isManager && (
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-red-500 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition disabled:opacity-50"
                        >
                          {deletingId === p.id ? (
                            <div className="w-3 h-3 border-2 border-red-400 border-t-transparent animate-spin rounded-full" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                          {deletingId === p.id ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default ProductTable;
