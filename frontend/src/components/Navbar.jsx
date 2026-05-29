import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isStudying } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e) => {
    if (isStudying) {
      e.preventDefault();
      alert("You cannot leave while a study session is active. Please end the timer first.");
    }
  };

  const handleLogout = () => {
    if (isStudying) {
      alert("You cannot leave while a study session is active. Please end the timer first.");
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 border-x-0 rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" onClick={handleNavClick} className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <span className="text-xl font-bold gradient-text">BrainBrew</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={handleNavClick}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? "bg-primary-600/20 text-primary-300 border border-primary-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-gray-400 hidden sm:block">
                {user.name}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex justify-around py-2 border-t border-white/5">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={handleNavClick}
            className={`flex flex-col items-center gap-0.5 text-xs ${
              location.pathname === link.to
                ? "text-primary-400"
                : "text-gray-500"
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
