import { useState } from "react";
import { createProduct } from "../../api/product";
import { PackagePlus } from "lucide-react";
import { card, cardTitle } from "../../styles/cn";

const ProductForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    quantity: "",  // ← was "stock", now matches backend
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
    setFileName(file?.name || "");
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
    } catch (err) {
      console.error("Failed to create product:", err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-9 px-3 text-base text-ink bg-surface-muted border border-border rounded-md outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-ink-faint";

  return (
    <div className={card}>
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-primary-50 flex items-center justify-center">
          <PackagePlus size={14} className="text-primary-500" />
        </div>
        <p className={cardTitle}>Add New Product</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-muted font-medium">Product Name</label>
            <input
              name="name"
              value={form.name}
              placeholder="e.g. Laptop"
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          {/* SKU */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-muted font-medium">SKU</label>
            <input
              name="sku"
              value={form.sku}
              placeholder="e.g. LAP-001"
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-muted font-medium">Price (₹)</label>
            <input
              name="price"
              type="number"
              value={form.price}
              placeholder="e.g. 50000"
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-muted font-medium">Quantity</label>
            <input
              name="quantity"     // ← matches backend field
              type="number"
              value={form.quantity}
              placeholder="e.g. 100"
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          {/* Image */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-muted font-medium">Product Image</label>
            <label className="h-9 px-3 flex items-center gap-2 bg-surface-muted border border-border border-dashed rounded-md cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
              <span className="text-base text-ink-faint truncate">
                {fileName || "Choose file..."}
              </span>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 h-9 px-5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <PackagePlus size={14} />
            )}
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;