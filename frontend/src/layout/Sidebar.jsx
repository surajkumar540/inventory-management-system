import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore"; // adjust path if needed

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  // 🔥 ROLE-BASED NAV CONFIG
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/", role: "admin" },
    { label: "Products", icon: Package, to: "/products" },
    { label: "Orders", icon: ShoppingCart, to: "/orders" },
    { label: "Analytics", icon: BarChart3, to: "/analytics", role: "admin" },
    { label: "Settings", icon: Settings, to: "/settings" },
  ];

  // 🔥 FILTER BASED ON ROLE
  const filteredNavItems = navItems.filter(
    (item) => !item.role || item.role === user?.role
  );

  return (
    <aside className="w-sidebar h-screen bg-surface border-r border-border flex flex-col px-3 py-4 fixed left-0 top-0 bottom-0 z-10">

      {/* Logo */}
      <div className="flex items-center gap-2 px-2 pb-4 mb-3 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-primary-500 flex items-center justify-center">
          <Zap size={14} className="text-white" />
        </div>
        <span className="text-md font-semibold text-ink">
          Stock<span className="text-primary-500">Flow</span>
        </span>
      </div>

      {/* Nav label */}
      <p className="text-2xs font-semibold text-ink-faint uppercase tracking-widest px-2 mb-1">
        Main
      </p>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5">
        {filteredNavItems.map((item) => {
          const active = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-base transition-all
                ${
                  active
                    ? "bg-primary-50 text-primary-600 font-medium"
                    : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                }`}
            >
              <item.icon size={15} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer (User Info) */}
      <div className="mt-auto pt-3 border-t border-border">
        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-surface-muted cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center text-xs font-semibold text-primary-500">
            {user?.email?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              {user?.email || "User"}
            </p>
            <p className="text-xs text-ink-faint capitalize">
              {user?.role || "user"}
            </p>
          </div>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;