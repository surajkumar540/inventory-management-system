import { Search, Bell, Calendar, Command, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore"; // adjust path if needed

const Navbar = ({ title = "Dashboard" }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // 🔥 LOGOUT HANDLER
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-[60px] bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center px-6 gap-3 sticky top-0 z-10"
    >
      {/* LEFT */}
      <div>
        <p className="text-[15px] font-bold text-slate-800 leading-none">
          {title}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Overview & analytics
        </p>
      </div>

      {/* RIGHT */}
      <div className="ml-auto flex items-center gap-2">

        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] text-slate-400 cursor-text hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors w-44 group">
          <Search size={12} />
          <span className="flex-1">Search...</span>
          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-slate-200/80 text-[9px] font-semibold">
            <Command size={8} /> K
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] text-slate-500">
          <Calendar size={11} />
          {today}
        </div>

        {/* Bell */}
        <div className="relative w-9 h-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-indigo-50 transition">
          <Bell size={14} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-white" />
        </div>

        {/* USER + LOGOUT */}
        <div className="flex items-center gap-2 ml-2">

          <div className="text-right">
            <p className="text-[12px] font-semibold text-slate-700">
              {user?.email || "User"}
            </p>
            <p className="text-[10px] text-slate-400">
              {user?.role}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-2 text-[12px] bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition"
          >
            <LogOut size={12} />
            Logout
          </button>

        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;