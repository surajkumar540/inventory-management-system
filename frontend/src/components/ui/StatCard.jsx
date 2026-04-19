import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { card } from "../../styles/cn";

const colorMap = {
  indigo: {
    icon: "bg-primary-50 text-primary-500",
    bar:  "bg-primary-400",
    top:  "bg-brand-gradient",
    trend:"text-primary-500",
  },
  green: {
    icon: "bg-success-50 text-success-600",
    bar:  "bg-success-500",
    top:  "bg-success-gradient",
    trend:"text-success-600",
  },
  amber: {
    icon: "bg-warning-50 text-warning-600",
    bar:  "bg-warning-500",
    top:  "bg-warning-gradient",
    trend:"text-warning-600",
  },
  red: {
    icon: "bg-danger-50 text-danger-600",
    bar:  "bg-danger-500",
    top:  "bg-danger-gradient",
    trend:"text-danger-600",
  },
};

const StatCard = ({ title, value, icon: Icon, color = "indigo", trend, trendLabel, progress }) => {
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${card} relative overflow-hidden`}
    >
      {/* top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${c.top}`} />

      {/* icon */}
      <div className={`w-8 h-8 rounded-md flex items-center justify-center mb-3 ${c.icon}`}>
        <Icon size={15} />
      </div>

      {/* label */}
      <p className="text-2xs text-ink-faint uppercase tracking-widest mb-1">{title}</p>

      {/* value */}
      <p className="text-3xl font-semibold text-ink font-mono">{value}</p>

      {/* trend */}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium
          ${trend > 0 ? "text-success-600" : trend < 0 ? "text-danger-500" : "text-ink-faint"}`}>
          {trend > 0 ? <TrendingUp size={11}/> : trend < 0 ? <TrendingDown size={11}/> : <Minus size={11}/>}
          {trendLabel}
        </div>
      )}

      {/* progress bar */}
      {progress !== undefined && (
        <div className="mt-3 h-1 rounded-full bg-surface-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${c.bar}`}
          />
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;