import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UsersTab from "./UsersTab";
import BranchesTab from "./BranchesTab";
import useAuthStore from "../../stores/useAuthStore";
import { Settings2, Users, GitBranch } from "lucide-react";

const TAB_CONFIG = {
  Users:    { icon: Users,     color: "from-violet-500 to-indigo-600",  shadow: "shadow-violet-200/60" },
  Branches: { icon: GitBranch, color: "from-teal-500 to-emerald-600",   shadow: "shadow-teal-200/60"  },
};

export default function Settings() {
  const { user } = useAuthStore();
  const isSuperAdmin  = user?.role === "SUPER_ADMIN";
  const isBranchAdmin = user?.role === "BRANCH_ADMIN";

  const TABS = isSuperAdmin || !isBranchAdmin ? ["Users", "Branches"] : ["Users"];
  const [active, setActive] = useState("Users");

  const ActiveIcon = TAB_CONFIG[active]?.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 min-h-screen bg-slate-50/50 space-y-6"
    >
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
            <Settings2 size={18} className="text-slate-500" />
          </div>
          <div>
            <h1 className="text-[22px] font-black text-slate-800 tracking-tight">Settings</h1>
            <p className="text-[12px] font-medium text-slate-400 mt-0.5">
              Manage users and branch locations
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Tab Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-2xl p-1.5 w-fit shadow-sm"
      >
        {TABS.map((tab) => {
          const cfg = TAB_CONFIG[tab];
          const Icon = cfg.icon;
          const isActive = active === tab;

          return (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="tab-pill"
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${cfg.color} shadow-md ${cfg.shadow}`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-2 transition-colors ${isActive ? "text-white" : "text-slate-500 hover:text-slate-700"}`}>
                <Icon size={14} />
                {tab}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* ── Tab Content ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
          >
            {active === "Users"    && <UsersTab />}
            {active === "Branches" && <BranchesTab />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}