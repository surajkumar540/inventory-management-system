import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "../../api/product";
import { createOrder } from "../../api/order";
import { ShoppingCart, Plus, Minus, X, Package, CheckCircle } from "lucide-react";

const OrderForm = ({ onSuccess }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getProducts().then((res) => setProducts(res.data.data));
  }, []);

  const addToCart = (product) => {
    const existing = cart.find((c) => c.id === product.id);
    if (existing) {
      setCart(cart.map((c) => c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart
      .map((c) => c.id === id ? { ...c, quantity: Math.max(1, c.quantity + delta) } : c)
    );
  };

  const removeItem = (id) => setCart(cart.filter((c) => c.id !== id));

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleSubmit = async () => {
    if (!cart.length) return;
    setLoading(true);
    try {
      await createOrder({ items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })) });
      setCart([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      onSuccess();
    } catch (err) {
      console.error("Create order error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow shadow-indigo-200">
          <ShoppingCart size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-slate-700">Create New Order</p>
          <p className="text-[11px] text-slate-400">Select products to add to cart</p>
        </div>
        {cart.length > 0 && (
          <span className="ml-auto text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
            {cart.length} item{cart.length > 1 ? "s" : ""} · ₹{cartTotal.toLocaleString("en-IN")}
          </span>
        )}
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Products Grid */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Available Products
          </p>
          <div className="flex flex-wrap gap-2">
            {products.map((p) => {
              const inCart = cart.find((c) => c.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-medium transition-all
                    ${inCart
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-500"
                    }`}
                >
                  <Package size={11} />
                  {p.name}
                  {inCart && (
                    <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {inCart.quantity}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cart */}
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Cart
              </p>
              <div className="space-y-2">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5"
                  >
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-slate-700">{item.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        ₹{item.price?.toLocaleString("en-IN")} each
                      </p>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-indigo-300 hover:text-indigo-500 transition-colors">
                        <Minus size={10} />
                      </button>
                      <span className="w-8 text-center text-[13px] font-bold text-slate-700 font-mono">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQty(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-indigo-300 hover:text-indigo-500 transition-colors">
                        <Plus size={10} />
                      </button>
                    </div>

                    <span className="w-20 text-right text-[13px] font-bold font-mono text-slate-700">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>

                    <button onClick={() => removeItem(item.id)}
                      className="w-6 h-6 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors">
                      <X size={10} />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Total + Submit */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total</p>
                  <p className="text-[20px] font-bold font-mono text-slate-800">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading || success}
                  className={`flex items-center gap-2 h-10 px-6 rounded-xl text-[13px] font-semibold transition-all shadow-sm disabled:cursor-not-allowed
                    ${success
                      ? "bg-emerald-500 text-white shadow-emerald-200"
                      : "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-indigo-200 hover:shadow-indigo-300"
                    }`}
                >
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : success ? (
                    <CheckCircle size={15} />
                  ) : (
                    <ShoppingCart size={14} />
                  )}
                  {loading ? "Placing…" : success ? "Order placed!" : "Place Order"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default OrderForm;