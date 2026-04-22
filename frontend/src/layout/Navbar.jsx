import { Search, Bell, Calendar, Command, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuthStore from "../stores/useAuthStore";

const Navbar = ({ title = "Dashboard", onMenuToggle }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-[60px] bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center px-3 sm:px-6 gap-2 sm:gap-3 sticky top-0 z-10"
    >
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-500 transition-colors shrink-0"
      >
        <Menu size={16} />
      </button>

      {/* LEFT — Title */}
      <div className="min-w-0">
        <p className="text-[14px] sm:text-[15px] font-bold text-slate-800 leading-none truncate">
          {title}
        </p>
        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">
          Overview &amp; analytics
        </p>
      </div>

      {/* RIGHT */}
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">

        {/* Search — hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] text-slate-400 cursor-text hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors w-36 lg:w-44">
          <Search size={12} />
          <span className="flex-1">Search...</span>
          <div className="hidden lg:flex items-center gap-0.5 px-1 py-0.5 rounded bg-slate-200/80 text-[9px] font-semibold">
            <Command size={8} /> K
          </div>
        </div>

        {/* Date — hidden on small screens */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 sm:px-3 py-2 text-[11px] sm:text-[12px] text-slate-500 shrink-0">
          <Calendar size={11} />
          <span className="hidden md:inline">{today}</span>
          <span className="md:hidden">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
        </div>

        {/* Bell */}
        <div className="relative w-9 h-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-colors shrink-0">
          <Bell size={14} className="text-slate-500" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-white" />
        </div>

        {/* User — desktop */}
        <div className="hidden sm:flex items-center gap-2 ml-1">
          <div className="text-right hidden md:block">
            <p className="text-[12px] font-semibold text-slate-700 max-w-[120px] truncate">
              {user?.email || "User"}
            </p>
            <p className="text-[10px] text-slate-400 capitalize">
              {user?.role?.toLowerCase()}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-2 text-[11px] sm:text-[12px] bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors shrink-0"
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* User avatar — mobile only (tap to show menu) */}
        <div className="sm:hidden relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-[12px] font-bold text-indigo-600"
          >
            {user?.email?.charAt(0)?.toUpperCase() || "U"}
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50"
              >
                <div className="px-2 py-1.5 mb-2">
                  <p className="text-[13px] font-semibold text-slate-700 truncate">{user?.email}</p>
                  <p className="text-[11px] text-slate-400 capitalize">{user?.role?.toLowerCase()}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <LogOut size={13} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.header>
  );
};

export default Navbar;