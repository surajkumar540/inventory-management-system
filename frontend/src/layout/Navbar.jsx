import { Search, Bell, Calendar } from "lucide-react";

const Navbar = ({ title = "Dashboard" }) => {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <header className="h-navbar bg-surface border-b border-border flex items-center px-6 gap-3 sticky top-0 z-10">
      <div>
        <p className="text-md font-semibold text-ink">{title}</p>
        <p className="text-xs text-ink-faint">Overview & analytics</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <div className="flex items-center gap-2 bg-surface-muted border border-border rounded-md px-3 py-1.5 text-sm text-ink-faint cursor-text">
          <Search size={12} className="text-ink-faint" />
          Search...
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 bg-surface-muted border border-border rounded-md px-3 py-1.5 text-sm text-ink-muted">
          <Calendar size={12} className="text-ink-faint" />
          {today}
        </div>

        {/* Bell */}
        <div className="relative w-8 h-8 bg-surface-muted border border-border rounded-md flex items-center justify-center cursor-pointer hover:bg-surface-page">
          <Bell size={14} className="text-ink-muted" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-danger-500 border border-surface" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;