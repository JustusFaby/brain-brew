import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, dashRes] = await Promise.all([
          api.get("/session/analytics"),
          api.get("/session/dashboard"),
        ]);
        setAnalytics(analyticsRes.data);
        setDashboard(dashRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen ambient-bg">
      <Navbar />
      <div className="pt-24 pb-10 px-4 max-w-3xl mx-auto relative z-10 page-enter">
        <div className="glass-card p-8 text-center mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-coffee-200/20 to-coffee-100/10" />

          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-coffee-500 to-coffee-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 shadow-xl shadow-coffee-500/20">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>

            <h1 className="text-2xl font-bold text-coffee-900">{user?.name}</h1>
            <p className="text-dark-500 text-sm mt-1">{user?.email}</p>

            {dashboard && (
              <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
                <span className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
                  🔥 {dashboard.streak} day streak
                </span>
                <span className="text-sm bg-coffee-100 text-coffee-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
                  🏆 Rank #{dashboard.rank}
                </span>
              </div>
            )}
          </div>
        </div>

        <h2 className="text-lg font-semibold text-coffee-900 mb-4 flex items-center gap-2">
          📊 Study Analytics
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-6">
                <div className="h-4 skeleton rounded w-1/2 mb-3" />
                <div className="h-8 skeleton rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="glass-card-hover p-6">
              <p className="text-sm text-dark-400 mb-2 flex items-center gap-1.5">
                ⏱️ Today
              </p>
              <p className="text-2xl font-bold bg-gradient-to-r from-coffee-400 to-coffee-500 bg-clip-text text-transparent">
                {parseInt(analytics.todayMinutes || 0, 10)} min
              </p>
            </div>
            <div className="glass-card-hover p-6">
              <p className="text-sm text-dark-400 mb-2 flex items-center gap-1.5">
                📅 This Week
              </p>
              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                {parseInt(analytics.weeklyMinutes || 0, 10)} min
              </p>
            </div>
            <div className="glass-card-hover p-6">
              <p className="text-sm text-dark-400 mb-2 flex items-center gap-1.5">
                📈 This Month
              </p>
              <p className="text-2xl font-bold bg-gradient-to-r from-focus-400 to-focus-500 bg-clip-text text-transparent">
                {parseInt(analytics.monthlyMinutes || 0, 10)} min
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 border border-red-200 text-red-600 font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:bg-red-100 hover:border-red-300"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
