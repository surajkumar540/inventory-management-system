import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, PackagePlus, Upload, X, Trash2, Package,
  Search, TrendingUp, AlertTriangle, CheckCircle2,
  ChevronRight, BarChart3, Pencil,
} from "lucide-react";
import { getProducts, createProduct, deleteProduct, updateProduct } from "../../api/product";
import useAuthStore from "../../stores/useAuthStore";

const StatCard = ({ label, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    className={`relative overflow-hidden rounded-2xl border p-5 bg-white ${color.border}`}
  >
    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] ${color.bg}`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">{label}</p>
        <p className={`text-[28px] font-black leading-none ${color.text}`}>{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.iconBg}`}>
        <Icon size={16} className={color.iconColor} />
      </div>
    </div>
  </motion.div>
);

const StockBadge = ({ qty }) => {
  if (qty === 0) return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-red-50 text-red-500 border border-red-100 uppercase tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Out of stock
    </span>
  );
  if (qty <= 10) return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Low · {qty}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {qty} units
    </span>
  );
};

const EMPTY_FORM = { name: "", sku: "", price: "", quantity: "", threshold: "", image: null };

const ProductForm = ({ onSuccess }) => {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview]   = useState(null);
  const [open, setOpen]         = useState(false);
  const [error, setError]       = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, image: file });
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
  };

  const clearFile = () => { setForm({ ...form, image: null }); setFileName(""); setPreview(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Name is required");
    if (!form.price)       return setError("Price is required");
    if (!form.sku.trim())  return setError("SKU is required");
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key] !== null && form[key] !== "") data.append(key, form[key]);
      });
      await createProduct(data);
      onSuccess();
      setForm(EMPTY_FORM);
      setFileName(""); setPreview(null); setOpen(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-11 px-3.5 text-[13px] text-slate-700 bg-slate-50/80 border border-slate-200 rounded-xl outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white transition-all placeholder:text-slate-300 w-full font-medium";
  const labelClass = "text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white hover:from-violet-50/40 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <PackagePlus size={15} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-[14px] font-bold text-slate-700">Add New Product</p>
            <p className="text-[11px] text-slate-400">Click to expand form</p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-violet-500 transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-6 py-5">
              {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div>
                    <label className={labelClass}>Name *</label>
                    <input name="name" value={form.name} placeholder="e.g. Laptop Pro" onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>SKU *</label>
                    <input name="sku" value={form.sku} placeholder="e.g. LAP-001" onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Price (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">₹</span>
                      <input name="price" type="number" value={form.price} placeholder="0" onChange={handleChange} className={`${inputClass} pl-7`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Quantity</label>
                    <input name="quantity" type="number" value={form.quantity} placeholder="0" onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Threshold</label>
                    <input name="threshold" type="number" value={form.threshold} placeholder="10" onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Image</label>
                    {preview ? (
                      <div className="h-11 flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-3">
                        <img src={preview} alt="preview" className="w-7 h-7 rounded-lg object-cover" />
                        <span className="text-[11px] text-violet-600 font-semibold flex-1 truncate">{fileName}</span>
                        <button type="button" onClick={clearFile} className="w-5 h-5 rounded-full bg-violet-200 flex items-center justify-center text-violet-600 hover:bg-violet-300 transition-colors">
                          <X size={9} />
                        </button>
                      </div>
                    ) : (
                      <label className="h-11 flex items-center gap-2 bg-slate-50/80 border border-dashed border-slate-200 rounded-xl px-3.5 cursor-pointer hover:border-violet-400 hover:bg-violet-50/40 transition-all group">
                        <Upload size={13} className="text-slate-400 group-hover:text-violet-500 transition-colors" />
                        <span className="text-[12px] text-slate-400 group-hover:text-violet-500 font-medium transition-colors">Choose image…</span>
                        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
                <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setOpen(false)} className="h-10 px-5 text-[12px] font-semibold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                  <button type="submit" disabled={loading} className="flex items-center gap-2 h-10 px-6 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white text-[13px] font-bold rounded-xl transition-all shadow-md shadow-violet-200/60 disabled:opacity-60">
                    {loading ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <PackagePlus size={14} />}
                    {loading ? "Adding…" : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Edit Modal
const EditModal = ({ product, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name:      product.name,
    sku:       product.sku,
    price:     product.price,
    threshold: product.threshold,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim()) return setError("Name is required");
    if (!form.price)       return setError("Price is required");
    setLoading(true);
    try {
      await updateProduct(product.id, form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-10 px-3 text-[13px] text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all w-full";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-bold text-slate-800">Edit Product</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
        </div>
        <div className="flex flex-col gap-3">
          {[["name","Name *"],["sku","SKU"],["price","Price (₹) *"],["threshold","Low Stock Threshold"]].map(([key, label]) => (
            <div key={key}>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
              <input
                type={key === "price" || key === "threshold" ? "number" : "text"}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className={inputClass}
              />
            </div>
          ))}
        </div>
        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
        <div className="flex gap-2 justify-end mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-all"
          >
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductTable = ({ products, onRefresh, canManage }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch]         = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const safeProducts = Array.isArray(products) ? products : [];

  const filtered = safeProducts.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
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

  return (
    <>
      {editProduct && (
        <EditModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSuccess={() => { onRefresh(); setEditProduct(null); }}
        />
      )}

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <BarChart3 size={15} className="text-slate-500" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-700">Inventory</p>
              <p className="text-[11px] text-slate-400">{safeProducts.length} product{safeProducts.length !== 1 ? "s" : ""} total</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 w-full sm:w-60 group focus-within:border-violet-300 focus-within:bg-violet-50/20 transition-all">
            <Search size={13} className="text-slate-400 group-focus-within:text-violet-400 transition-colors shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or SKU…"
              className="flex-1 bg-transparent text-[12.5px] font-medium text-slate-600 placeholder:text-slate-300 outline-none"
            />
            {search && <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500"><X size={12} /></button>}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
              <Package size={22} className="opacity-50" />
            </div>
            <p className="text-[14px] font-semibold text-slate-400">{search ? "No products match your search" : "No products yet"}</p>
            <p className="text-[12px] text-slate-300 mt-1">{search ? "Try a different keyword" : "Add your first product above"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/60">
                  {["Image","Product","SKU","Price","Stock","Branch",...(canManage ? ["Actions"] : [])].map((h, i) => (
                    <th key={h} className={`text-[10px] text-slate-400 font-bold uppercase tracking-widest py-3 px-4 ${i === 0 ? "pl-6" : ""} ${h === "Actions" ? "text-right pr-6" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -12, transition: { duration: 0.2 } }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="py-3 pl-6 pr-4">
                        {p.image ? (
                          <img src={encodeURI(p.image?.replace(/\\/g, "/"))} alt={p.name} className="w-11 h-11 object-cover rounded-xl border border-slate-200 shadow-sm" />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center">
                            <Package size={15} className="text-slate-300" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-[13px] font-bold text-slate-700">{p.name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-mono font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">{p.sku || "—"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[14px] font-black font-mono text-slate-800">₹{p.price?.toLocaleString("en-IN")}</span>
                      </td>
                      <td className="py-3 px-4">
                        <StockBadge qty={p.quantity} />
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[12px] text-slate-500">{p.branch?.name || "—"}</span>
                      </td>
                      {canManage && (
                        <td className="py-3 px-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditProduct(p)}
                              className="inline-flex items-center gap-1.5 h-8 px-3 text-[11.5px] font-semibold text-violet-500 bg-violet-50 border border-violet-100 rounded-xl hover:bg-violet-100 transition-all"
                            >
                              <Pencil size={11} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              disabled={deletingId === p.id}
                              className="inline-flex items-center gap-1.5 h-8 px-3 text-[11.5px] font-semibold text-red-500 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all disabled:opacity-40"
                            >
                              {deletingId === p.id ? <div className="w-3 h-3 border-2 border-red-400 border-t-transparent animate-spin rounded-full" /> : <Trash2 size={11} />}
                              {deletingId === p.id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

const Products = () => {
  const { user } = useAuthStore();
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const canManage = ["SUPER_ADMIN", "ADMIN", "BRANCH_ADMIN"].includes(user?.role);

  const fetchProducts = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await getProducts();
      setProducts(res?.data?.data ?? []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const safeProducts = Array.isArray(products) ? products : [];
  const outOfStock   = safeProducts.filter((p) => p.quantity === 0).length;
  const lowStock     = safeProducts.filter((p) => p.quantity > 0 && p.quantity <= 10).length;
  const inStock      = safeProducts.filter((p) => p.quantity > 10).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6 p-6 min-h-screen bg-slate-50/50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-black text-slate-800 tracking-tight">Products</h1>
          <p className="text-[13px] text-slate-400 mt-0.5 font-medium">Manage your product catalog and inventory</p>
        </div>
        <button
          onClick={() => fetchProducts(true)}
          disabled={refreshing}
          className="flex items-center gap-2 h-9 px-4 text-[12px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all disabled:opacity-60"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Products" value={safeProducts.length} icon={Package}       delay={0.05} color={{ border: "border-slate-200/80", bg: "bg-slate-500",   text: "text-slate-800",   iconBg: "bg-slate-50",   iconColor: "text-slate-500"  }} />
          <StatCard label="In Stock"       value={inStock}             icon={CheckCircle2}  delay={0.1}  color={{ border: "border-emerald-100",  bg: "bg-emerald-500", text: "text-emerald-700", iconBg: "bg-emerald-50", iconColor: "text-emerald-500" }} />
          <StatCard label="Low Stock"      value={lowStock}            icon={TrendingUp}    delay={0.15} color={{ border: "border-amber-100",    bg: "bg-amber-500",   text: "text-amber-700",   iconBg: "bg-amber-50",   iconColor: "text-amber-500"  }} />
          <StatCard label="Out of Stock"   value={outOfStock}          icon={AlertTriangle} delay={0.2}  color={{ border: "border-red-100",      bg: "bg-red-500",     text: "text-red-600",     iconBg: "bg-red-50",     iconColor: "text-red-500"    }} />
        </div>
      )}

      {canManage && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <ProductForm onSuccess={() => fetchProducts(true)} />
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        {loading ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col items-center justify-center h-52 gap-3">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent animate-spin rounded-full" />
            <p className="text-[12px] font-medium text-slate-400">Loading products…</p>
          </div>
        ) : (
          <ProductTable products={safeProducts} onRefresh={() => fetchProducts(true)} canManage={canManage} />
        )}
      </motion.div>
    </motion.div>
  );
};

export default Products;