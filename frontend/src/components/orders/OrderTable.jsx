import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, XCircle, ShoppingBag } from "lucide-react";

const OrderTable = ({ orders, onDelete }) => {
  const [openRow, setOpenRow] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
          <ShoppingBag size={14} className="text-slate-500" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-slate-700">All Orders</p>
          <p className="text-[11px] text-slate-400">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest py-3 px-6 text-left">Order</th>
            <th className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest py-3 px-3 text-left">Date</th>
            <th className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest py-3 px-3 text-right">Items</th>
            <th className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest py-3 px-3 text-right">Amount</th>
            <th className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest py-3 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => {
            const total = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
            const isOpen = openRow === o.id;

            return (
              <>
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setOpenRow(isOpen ? null : o.id)}
                  className={`border-t border-slate-100 cursor-pointer transition-colors
                    ${isOpen ? "bg-indigo-50/40" : "hover:bg-slate-50/60"}`}
                >
                  <td className="py-3.5 px-6">
                    <p className="text-[13px] font-bold text-slate-700">
                      #ORD-{String(o.id).padStart(3, "0")}
                    </p>
                  </td>
                  <td className="py-3.5 px-3 text-[12px] text-slate-400 font-mono">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {o.items.length}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-[14px] text-slate-700">
                    ₹{total.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(o.id); }}
                        className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] font-medium text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-all"
                      >
                        <XCircle size={11} />
                        Cancel
                      </button>
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </div>
                    </div>
                  </td>
                </motion.tr>

                {/* Expanded */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.tr
                      key={`${o.id}-expand`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan="5" className="px-6 pb-4 bg-indigo-50/30 border-t border-indigo-100/50">
                        <div className="pt-3 space-y-2">
                          {o.items.map((item) => (
                            <div key={item.id}
                              className="flex items-center justify-between bg-white border border-slate-200/80 rounded-xl px-4 py-2.5">
                              <div>
                                <p className="text-[13px] font-semibold text-slate-700">
                                  {item.product?.name}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                  {item.quantity} × ₹{item.price?.toLocaleString("en-IN")}
                                </p>
                              </div>
                              <span className="text-[13px] font-bold font-mono text-slate-700">
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );
};

export default OrderTable;