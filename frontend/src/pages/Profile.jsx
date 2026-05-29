import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-10 px-4 max-w-3xl mx-auto">
        {/* Profile header */}
        <div className="glass-card p-8 text-center mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-pink-600/10" />
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg shadow-primary-500/30">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
            {dashboard && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <span className="text-sm bg-primary-500/10 text-primary-300 px-3 py-1 rounded-full">
                  🔥 {dashboard.streak} day streak
                </span>
                <span className="text-sm bg-yellow-500/10 text-yellow-300 px-3 py-1 rounded-full">
                  🏆 Rank #{dashboard.rank}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Study analytics */}
        <h2 className="text-lg font-semibold text-white mb-4">Study Analytics</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-1/2 mb-3" />
                <div className="h-8 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card-hover p-6">
              <p className="text-sm text-gray-400 mb-2">Today</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {Math.round(analytics.todayMinutes)} min
              </p>
            </div>
            <div className="glass-card-hover p-6">
              <p className="text-sm text-gray-400 mb-2">This Week</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                {Math.round(analytics.weeklyMinutes)} min
              </p>
            </div>
            <div className="glass-card-hover p-6">
              <p className="text-sm text-gray-400 mb-2">This Month</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                {Math.round(analytics.monthlyMinutes)} min
              </p>
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="mt-8">
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:bg-red-500/20"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
