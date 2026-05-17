import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "../../api/product";
import { createOrder } from "../../api/order";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Package,
  CheckCircle,
  AlertTriangle,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

/* ── tiny helpers ── */
const fmt = (n) => Number(n).toLocaleString("en-IN");

const StockPill = ({ qty }) => {
  if (qty === 0)
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-50 text-red-500 border border-red-100 uppercase tracking-wide">
        <span className="w-1 h-1 rounded-full bg-red-400" />
        Out of stock
      </span>
    );
  if (qty <= 10)
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wide">
        <span className="w-1 h-1 rounded-full bg-amber-400" />
        Only {qty} left
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">
      <span className="w-1 h-1 rounded-full bg-emerald-400" />
      {qty} in stock
    </span>
  );
};

const OrderForm = ({ onSuccess }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProducts().then((res) => setProducts(res.data.data ?? []));
  }, []);

  /* ── cart helpers ── */
  const stockFor = (id) => products.find((p) => p.id === id)?.quantity ?? 0;

  const addToCart = (product) => {
    if (product.quantity === 0) return; // guard: out-of-stock
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) {
        // don't exceed available stock
        if (existing.quantity >= product.quantity) return prev;
        return prev.map((c) =>
          c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setError("");
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id !== id) return c;
          const next = c.quantity + delta;
          if (next < 1) return null; // will be filtered
          if (next > stockFor(id)) return c; // cap at stock
          return { ...c, quantity: next };
        })
        .filter(Boolean)
    );
  };

  const removeItem = (id) => setCart((prev) => prev.filter((c) => c.id !== id));

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!cart.length) return;
    setLoading(true);
    setError("");
    try {
      await createOrder({
        items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
      });
      setCart([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onSuccess?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to place order. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const availableProducts = products.filter((p) => p.quantity > 0);
  const unavailableProducts = products.filter((p) => p.quantity === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
          <ShoppingBag size={15} className="text-white" />
        </div>
        <div>
          <p className="text-[14px] font-bold text-slate-700">Create New Order</p>
          <p className="text-[11px] text-slate-400">
            Select available products to add to cart
          </p>
        </div>
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full"
            >
              <ShoppingCart size={11} />
              {cart.length} item{cart.length > 1 ? "s" : ""} · ₹{fmt(cartTotal)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* ── Available Products ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">
              Available Products
            </p>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              {availableProducts.length} available
            </span>
          </div>

          {availableProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-slate-200 text-slate-300">
              <Package size={24} className="mb-2 opacity-40" />
              <p className="text-[12px] font-medium text-slate-400">
                No products in stock
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableProducts.map((p) => {
                const inCart = cart.find((c) => c.id === p.id);
                const atMax = inCart?.quantity >= p.quantity;

                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    disabled={atMax}
                    title={
                      atMax
                        ? `Max stock reached (${p.quantity})`
                        : `Add ${p.name}`
                    }
                    className={`group flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all
                      ${
                        inCart
                          ? atMax
                            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-violet-200 hover:bg-violet-50/50 hover:text-violet-600"
                      }`}
                  >
                    <Package size={11} className="opacity-70" />
                    <span>{p.name}</span>

                    {/* qty badge */}
                    <AnimatePresence>
                      {inCart ? (
                        <motion.span
                          key="badge"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-5 h-5 rounded-full bg-violet-500 text-white text-[9px] font-black flex items-center justify-center"
                        >
                          {inCart.quantity}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="stock"
                          className="text-[9px] font-semibold text-slate-400"
                        >
                          {p.quantity <= 10 ? `${p.quantity} left` : ""}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Out-of-Stock (dimmed, non-clickable) ── */}
        {unavailableProducts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">
                Out of Stock
              </p>
              <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                {unavailableProducts.length} unavailable
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {unavailableProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 text-[12px] font-semibold text-slate-300 cursor-not-allowed select-none"
                  title="Not available — out of stock"
                >
                  <Package size={11} className="opacity-40" />
                  <span className="line-through opacity-60">{p.name}</span>
                  <StockPill qty={0} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Cart ── */}
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Cart · {cart.length} item{cart.length > 1 ? "s" : ""}
                </p>

                <div className="space-y-2">
                  <AnimatePresence>
                    {cart.map((item) => {
                      const maxStock = stockFor(item.id);
                      const atMax = item.quantity >= maxStock;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 16, transition: { duration: 0.18 } }}
                          className="flex items-center gap-3 bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 group"
                        >
                          {/* Image or icon */}
                          {item.image ? (
                            <img
                              src={encodeURI(item.image.replace(/\\/g, "/"))}
                              alt={item.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <Package size={13} className="text-slate-300" />
                            </div>
                          )}

                          {/* Name + price */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-slate-700 truncate">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[11px] text-slate-400 font-mono">
                                ₹{fmt(item.price)} each
                              </p>
                              {atMax && (
                                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                                  Max stock
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Qty controls */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-violet-300 hover:text-violet-500 transition-all hover:shadow-sm"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="w-8 text-center text-[13px] font-black text-slate-700 font-mono">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              disabled={atMax}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-violet-300 hover:text-violet-500 transition-all hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          {/* Line total */}
                          <span className="w-24 text-right text-[13px] font-black font-mono text-slate-800 shrink-0">
                            ₹{fmt(item.price * item.quantity)}
                          </span>

                          {/* Remove */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-7 h-7 rounded-lg bg-white border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-50 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X size={11} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Error banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-2.5 mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl"
                    >
                      <AlertTriangle
                        size={14}
                        className="text-red-500 mt-0.5 shrink-0"
                      />
                      <p className="text-[12px] font-semibold text-red-600">
                        {error}
                      </p>
                      <button
                        onClick={() => setError("")}
                        className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Total + CTA */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">
                      Order Total
                    </p>
                    <motion.p
                      key={cartTotal}
                      initial={{ scale: 0.95, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-[22px] font-black font-mono text-slate-800 leading-none"
                    >
                      ₹{fmt(cartTotal)}
                    </motion.p>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading || success}
                    className={`flex items-center gap-2 h-11 px-7 rounded-xl text-[13px] font-bold transition-all shadow-md disabled:cursor-not-allowed
                      ${
                        success
                          ? "bg-emerald-500 text-white shadow-emerald-200"
                          : "bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white shadow-violet-200/60 hover:shadow-violet-300/60"
                      }`}
                  >
                    {loading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : success ? (
                      <CheckCircle size={15} />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    {loading
                      ? "Placing order…"
                      : success
                      ? "Order placed!"
                      : "Place Order"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty cart hint */}
        {cart.length === 0 && availableProducts.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[12px] text-slate-300 text-center font-medium py-2"
          >
            Click a product above to add it to your cart
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default OrderForm;