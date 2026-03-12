import { Link } from "react-router-dom";
import { Search, Bell } from "lucide-react";

export function Navbar({ variant = "light", showSearch = false }) {
  const isDark = variant === "dark";
  return (
    <nav className={`sticky top-0 z-50 ${isDark ? "bg-white/5 backdrop-blur-xl border-b border-white/10" : "bg-white/80 backdrop-blur-xl border-b border-gray-100/80"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className={`font-bold text-xl tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">Travel Buddy</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/explore" className={`text-sm font-medium transition-colors ${isDark ? "text-white/90 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Explore</Link>
            <Link to="/matches" className={`text-sm font-medium transition-colors ${isDark ? "text-white/90 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Matches</Link>
            <a href="/#how-it-works" className={`text-sm font-medium transition-colors ${isDark ? "text-white/90 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>How it Works</a>
          </div>
          <div className="flex items-center gap-3">
            {showSearch && (
              <button className="p-2.5 rounded-xl hover:bg-gray-100/80 transition-colors">
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <Link to="/login" className={`text-sm font-medium ${isDark ? "text-white/90 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Log in</Link>
            <Link to="/signup" className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2.5 text-sm font-semibold shadow-soft hover:shadow-elevated hover:from-primary-700 hover:to-primary-600 transition-all duration-200">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
