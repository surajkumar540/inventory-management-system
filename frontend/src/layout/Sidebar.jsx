import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import useAuthStore from "../stores/useAuthStore";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/", role: "admin" },
  { label: "Products", icon: Package, to: "/products" },
  { label: "Orders", icon: ShoppingCart, to: "/orders" },
  { label: "Analytics", icon: BarChart3, to: "/analytics", role: "admin" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const filtered = navItems.filter(
    (item) => !item.role || item.role === user?.role
  );

  return (
    <aside className="w-[220px] h-screen bg-slate-900 flex flex-col px-3 py-5 fixed left-0 top-0 bottom-0 z-20">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.12),transparent_60%)] pointer-events-none" />

      {/* Logo */}
      <div className="relative flex items-center gap-2.5 px-2 pb-5 mb-2 border-b border-white/10">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Zap size={14} className="text-white" />
        </div>
        <span className="text-[15px] font-bold text-white tracking-tight">
          Stock<span className="text-indigo-400">Flow</span>
        </span>
      </div>

      {/* Nav label */}
      <p className="relative text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] px-2 mb-2">
        Navigation
      </p>

      {/* Nav Items */}
      <nav className="relative flex flex-col gap-0.5">
        {filtered.map((item, i) => {
          const active = location.pathname === item.to;
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link
                to={item.to}
                className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group
                  ${
                    active
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl bg-indigo-500/15 border border-indigo-500/20"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <item.icon
                  size={15}
                  className={`relative z-10 ${active ? "text-indigo-400" : ""}`}
                />
                <span className="relative z-10">{item.label}</span>
                {active && (
                  <ChevronRight
                    size={12}
                    className="relative z-10 ml-auto text-indigo-400"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative mt-auto pt-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-[12px] font-bold text-indigo-300">
            {user?.email?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-slate-200 truncate">
              {user?.email || "User"}
            </p>
            <p className="text-[10px] text-slate-500 capitalize">
              {user?.role || "user"}
            </p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;