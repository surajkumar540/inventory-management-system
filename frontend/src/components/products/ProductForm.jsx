import { useState } from "react";
import { motion } from "framer-motion";
import { PackagePlus, Upload, X } from "lucide-react";
import { createProduct } from "../../api/product";

const ProductForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ name: "", sku: "", price: "", quantity: "", image: null });
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, image: file });
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setForm({ ...form, image: null });
    setFileName("");
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key] !== null && form[key] !== "") data.append(key, form[key]);
      });
      await createProduct(data);
      onSuccess();
      setForm({ name: "", sku: "", price: "", quantity: "", image: null });
      setFileName("");
      setPreview(null);
    } catch (err) {
      console.error("Failed to create product:", err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-10 px-3 text-[13px] text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all placeholder:text-slate-300 w-full";
  const labelClass = "text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Header strip */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow shadow-indigo-200">
          <PackagePlus size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-slate-700">Add New Product</p>
          <p className="text-[11px] text-slate-400">Fill in the details below</p>
        </div>
      </div>

      <div className="px-6 py-5">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">

            {/* Name */}
            <div>
              <label className={labelClass}>Product Name</label>
              <input name="name" value={form.name} placeholder="e.g. Laptop"
                onChange={handleChange} required className={inputClass} />
            </div>

            {/* SKU */}
            <div>
              <label className={labelClass}>SKU</label>
              <input name="sku" value={form.sku} placeholder="e.g. LAP-001"
                onChange={handleChange} required className={inputClass} />
            </div>

            {/* Price */}
            <div>
              <label className={labelClass}>Price (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-slate-400">₹</span>
                <input name="price" type="number" value={form.price} placeholder="50000"
                  onChange={handleChange} required className={`${inputClass} pl-7`} />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className={labelClass}>Quantity</label>
              <input name="quantity" type="number" value={form.quantity} placeholder="100"
                onChange={handleChange} required className={inputClass} />
            </div>

            {/* Image */}
            <div>
              <label className={labelClass}>Product Image</label>
              {preview ? (
                <div className="h-10 flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3">
                  <img src={preview} alt="preview" className="w-6 h-6 rounded-md object-cover" />
                  <span className="text-[11px] text-indigo-600 font-medium flex-1 truncate">{fileName}</span>
                  <button type="button" onClick={clearFile}
                    className="w-4 h-4 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 hover:bg-indigo-300 transition-colors">
                    <X size={9} />
                  </button>
                </div>
              ) : (
                <label className="h-10 flex items-center gap-2 bg-slate-50 border border-slate-200 border-dashed rounded-xl px-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group">
                  <Upload size={12} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-[12px] text-slate-400 group-hover:text-indigo-500 transition-colors">
                    Choose file…
                  </span>
                  <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 h-10 px-6 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <PackagePlus size={14} />
              )}
              {loading ? "Adding…" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ProductForm;