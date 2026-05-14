import { useState } from "react";
import UsersTab    from "./UsersTab";
import BranchesTab from "./BranchesTab";
import useAuthStore from "../../stores/useAuthStore";

export default function Settings() {
  const { user } = useAuthStore();
  const isSuperAdmin  = user?.role === "SUPER_ADMIN";
  const isBranchAdmin = user?.role === "BRANCH_ADMIN";

  const TABS = isSuperAdmin || !isBranchAdmin
    ? ["Users", "Branches"]
    : ["Users"];

  const [active, setActive] = useState("Users");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h1>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors
              ${active === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === "Users"    && <UsersTab />}
      {active === "Branches" && <BranchesTab />}
    </div>
  );
}