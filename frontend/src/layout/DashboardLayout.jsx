import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const pageTitles = {
  "/":          "Dashboard",
  "/products":  "Products",
  "/orders":    "Orders",
  "/stock":     "Stock",
  "/analytics": "Analytics",
  "/ai":        "AI Predict",
};

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "StockFlow";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main content — offset for desktop sidebar */}
      <div className="flex-1 flex flex-col lg:ml-[220px] min-w-0">
        <Navbar
          title={title}
          onMenuToggle={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;