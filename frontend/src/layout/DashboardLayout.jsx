import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = () => {
  return (
    <div className="flex bg-surface-page min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-sidebar">
        <Navbar />

        {/* 🔥 THIS IS THE FIX */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;