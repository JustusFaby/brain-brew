import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isStudying, currentRoomId } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message) => {
    setToast(message);
  };

  const handleNavClick = (e, to) => {
    if (isStudying && currentRoomId) {
      e.preventDefault();
      showToast("🔒 You're in a study session. End the timer first!");
    }
  };

  const handleLogout = () => {
    if (isStudying) {
      showToast("🔒 You're in a study session. End the timer first!");
      return;
    }
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/rooms", label: "Rooms", icon: "🏠" },
    { to: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { to: "/profile", label: "Profile", icon: "👤" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] toast">
          <div className="bg-coffee-50 border border-coffee-300/50 backdrop-blur-xl rounded-xl px-5 py-3 text-coffee-700 text-sm font-medium shadow-warm flex items-center gap-2">
            {toast}
          </div>
        </div>
      )}

      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-coffee-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link
              to="/dashboard"
              onClick={(e) => handleNavClick(e, "/dashboard")}
              className="flex items-center gap-2.5 group"
            >
              <img src="/logo.jpg" alt="BrainBrew" className="w-9 h-9 rounded-full object-cover group-hover:scale-110 transition-transform shadow-sm" />
              <span className="text-xl font-bold gradient-text">BrainBrew</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(e) => handleNavClick(e, link.to)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                    isStudying && currentRoomId
                      ? "opacity-40 cursor-not-allowed"
                      : ""
                  } ${
                    isActive(link.to)
                      ? "text-coffee-600 bg-coffee-100/60"
                      : "text-dark-400 hover:text-coffee-700 hover:bg-coffee-50"
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                  {isActive(link.to) && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-coffee-500 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* In Session Badge */}
              {isStudying && (
                <div className="hidden sm:flex items-center gap-2 bg-coffee-100 border border-coffee-300/40 rounded-full px-3 py-1.5 pulse-badge">
                  <span className="w-2 h-2 bg-coffee-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-coffee-600">In Session</span>
                </div>
              )}

              {/* User Avatar */}
              {user && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-dark-400 hidden sm:block">
                    {user.name}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center text-white font-bold text-xs">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                </div>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-sm text-dark-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50 hidden md:block"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-coffee-200/40">
        <div className="flex justify-around py-2 px-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={(e) => handleNavClick(e, link.to)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-xs transition-all ${
                isStudying && currentRoomId ? "opacity-40" : ""
              } ${
                isActive(link.to)
                  ? "text-coffee-600"
                  : "text-dark-400"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
