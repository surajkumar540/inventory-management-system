import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const AlertBanner = ({ products = [] }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!products.length || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        className="relative flex items-start gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 rounded-xl px-4 py-3.5 overflow-hidden"
      >
        {/* Glow strip */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-400 rounded-l-xl" />

        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 ml-1">
          <AlertTriangle size={13} className="text-amber-600" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-amber-800">
            ⚠️ Low stock alert —{" "}
            <span className="text-amber-600">
              {products.length} product{products.length > 1 ? "s" : ""}
            </span>{" "}
            need restocking
          </p>
          <p className="text-[11px] text-amber-600 mt-0.5 truncate">
            {products
              .map((p) => `${p.name} (${p.quantity} left)`)
              .join("  ·  ")}
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="w-6 h-6 rounded-md flex items-center justify-center text-amber-400 hover:text-amber-700 hover:bg-amber-100 transition-colors shrink-0"
        >
          <X size={12} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default AlertBanner;