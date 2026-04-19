import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const AlertBanner = ({ products = [] }) => {
  if (!products.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2.5 bg-warning-50 border border-warning-100 rounded-md px-4 py-3 mb-2"
    >
      <AlertTriangle size={14} className="text-warning-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-warning-700">
          Low stock alert — {products.length} product{products.length > 1 ? "s" : ""} need attention
        </p>
        <p className="text-xs text-warning-600 mt-0.5">
          {products.map(p => `${p.name} (${p.quantity} left, threshold: ${p.threshold})`).join(" · ")}
        </p>
      </div>
    </motion.div>
  );
};

export default AlertBanner;