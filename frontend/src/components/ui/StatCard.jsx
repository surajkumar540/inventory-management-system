import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const colorMap = {
  indigo: {
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
    bar: "from-indigo-400 to-indigo-600",
    glow: "shadow-indigo-100",
    trendPos: "text-indigo-500",
    accent: "from-indigo-500/10 to-violet-500/5",
    dot: "bg-indigo-400",
  },
  green: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    bar: "from-emerald-400 to-teal-500",
    glow: "shadow-emerald-100",
    trendPos: "text-emerald-600",
    accent: "from-emerald-500/10 to-teal-500/5",
    dot: "bg-emerald-400",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    bar: "from-amber-400 to-orange-400",
    glow: "shadow-amber-100",
    trendPos: "text-amber-600",
    accent: "from-amber-500/10 to-orange-500/5",
    dot: "bg-amber-400",
  },
  red: {
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    bar: "from-red-400 to-rose-500",
    glow: "shadow-red-100",
    trendPos: "text-red-500",
    accent: "from-red-500/10 to-rose-500/5",
    dot: "bg-red-400",
  },
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "indigo",
  trend,
  trendLabel,
  progress,
  delay = 0,
}) => {
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={`relative overflow-hidden bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 group`}
    >
      {/* Subtle gradient blob top-right */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${c.accent} blur-2xl opacity-70 group-hover:opacity-100 transition-opacity`}
      />

      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r ${c.bar} opacity-80`}
      />

      <div className="relative">
        {/* Icon */}
        <div
          className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center mb-4 ${c.glow} shadow-sm`}
        >
          <Icon size={16} className={c.iconColor} />
        </div>

        {/* Title */}
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
          {title}
        </p>

        {/* Value */}
        <p className="text-[28px] font-bold text-slate-800 leading-none tracking-tight font-mono">
          {value}
        </p>

        {/* Trend */}
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1.5 mt-2 text-[11px] font-medium
              ${trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-500" : "text-slate-400"}`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center
              ${trend > 0 ? "bg-emerald-50" : trend < 0 ? "bg-red-50" : "bg-slate-100"}`}
            >
              {trend > 0 ? (
                <TrendingUp size={9} />
              ) : trend < 0 ? (
                <TrendingDown size={9} />
              ) : (
                <Minus size={9} />
              )}
            </span>
            {trendLabel}
          </div>
        )}

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="mt-4 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${c.bar}`}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;