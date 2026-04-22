import {
  LayoutDashboard, Package, ShoppingCart,
  BarChart3, Zap, ChevronRight, ArrowDownUp,
  Sparkles, X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../stores/useAuthStore";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/",          roles: ["ADMIN", "MANAGER"] },
  { label: "Products",  icon: Package,         to: "/products",  roles: ["ADMIN", "MANAGER", "STAFF"] },
  { label: "Orders",    icon: ShoppingCart,    to: "/orders",    roles: ["ADMIN", "MANAGER", "STAFF"] },
  { label: "Stock",     icon: ArrowDownUp,     to: "/stock",     roles: ["ADMIN", "MANAGER", "STAFF"] },
  { label: "Analytics", icon: BarChart3,       to: "/analytics", roles: ["ADMIN", "MANAGER"] },
  { label: "AI Predict",icon: Sparkles,        to: "/ai",        roles: ["ADMIN", "MANAGER"] },
];

// ── Shared nav content (used in both desktop + mobile) ──────────────────────
const SidebarContent = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const filtered = navItems.filter((item) => item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full px-3 py-5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.12),transparent_60%)] pointer-events-none" />

      {/* Logo row */}
      <div className="relative flex items-center gap-2.5 px-2 pb-5 mb-2 border-b border-white/10">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
          <Zap size={14} className="text-white" />
        </div>
        <span className="text-[15px] font-bold text-white tracking-tight">
          Stock<span className="text-indigo-400">Flow</span>
        </span>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors lg:hidden"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <p className="relative text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] px-2 mb-2">
        Navigation
      </p>

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
                onClick={onClose}
                className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                  ${active
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
                <item.icon size={15} className={`relative z-10 ${active ? "text-indigo-400" : ""}`} />
                <span className="relative z-10">{item.label}</span>
                {active && (
                  <ChevronRight size={12} className="relative z-10 ml-auto text-indigo-400" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative mt-auto pt-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-[12px] font-bold text-indigo-300 shrink-0">
            {user?.email?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-slate-200 truncate">
              {user?.email || "User"}
            </p>
            <p className="text-[10px] text-slate-500 capitalize">
              {user?.role?.toLowerCase() || "user"}
            </p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-[12px] text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

// ── Main Sidebar component ───────────────────────────────────────────────────
const Sidebar = ({ mobileOpen, onClose }) => {
  return (
    <>
      {/* ── Desktop sidebar (always visible on lg+) ── */}
      <aside className="hidden lg:flex w-[220px] h-screen bg-slate-900 flex-col fixed left-0 top-0 bottom-0 z-20">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar (overlay drawer) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[220px] bg-slate-900 z-40 flex flex-col"
            >
              <SidebarContent onClose={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;