import { Outlet, Link, useLocation } from "react-router-dom";
import { Search, Bell, Home, Compass, MessageCircle, User, Plus } from "lucide-react";

const NAV = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/matches", icon: Compass, label: "Matches" },
  { to: "/create", icon: Plus, label: "Create" },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-white pb-20 md:pb-0">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
        <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
          <Link to="/dashboard" className="font-bold text-xl tracking-tight">
            <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">Travel Buddy</span>
          </Link>
          <div className="hidden sm:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="search" placeholder="Search destination" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-surface/50 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500 ring-2 ring-white" />
            </button>
            <Link to="/profile" className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center font-semibold text-primary-700 text-sm shadow-soft">J</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100/80 flex justify-around py-2.5 md:hidden z-50 safe-area-pb shadow-premium">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[64px] transition-all duration-200 ${(n.to === "/profile" ? location.pathname.startsWith("/profile") : location.pathname === n.to) ? "text-primary-600 bg-primary-50/80" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/80"}`}>
            <n.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{n.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
