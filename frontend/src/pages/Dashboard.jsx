import { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/session/dashboard");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = data
    ? [
        {
          label: "Today's Study",
          value: `${Math.round(data.todayHours)} min`,
          icon: "⏱️",
          color: "from-blue-500 to-cyan-500",
          bg: "bg-blue-500/10",
        },
        {
          label: "Weekly Hours",
          value: `${Math.round(data.weeklyHours)} min`,
          icon: "📅",
          color: "from-emerald-500 to-green-500",
          bg: "bg-emerald-500/10",
        },
        {
          label: "Monthly Hours",
          value: `${Math.round(data.monthlyHours)} min`,
          icon: "📈",
          color: "from-orange-500 to-amber-500",
          bg: "bg-orange-500/10",
        },
        {
          label: "Streak",
          value: `${data.streak} days`,
          icon: "🔥",
          color: "from-red-500 to-pink-500",
          bg: "bg-red-500/10",
        },
        {
          label: "Rank",
          value: `#${data.rank}`,
          icon: "🏆",
          color: "from-yellow-500 to-amber-500",
          bg: "bg-yellow-500/10",
        },
        {
          label: "Status",
          value: data.status,
          icon: data.status === "studying" ? "🟢" : "⚪",
          color: "from-primary-500 to-violet-500",
          bg: "bg-primary-500/10",
        },
      ]
    : [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-10 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-gray-500 mt-1">Your study overview at a glance</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-1/2 mb-4" />
                <div className="h-8 bg-white/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="glass-card-hover p-6 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-400">
                    {stat.label}
                  </span>
                  <span
                    className={`text-2xl w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    {stat.icon}
                  </span>
                </div>
                <p
                  className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/rooms"
            className="glass-card-hover p-6 flex items-center gap-4"
          >
            <span className="text-3xl">🏠</span>
            <div>
              <h3 className="font-semibold text-white">Study Rooms</h3>
              <p className="text-sm text-gray-500">
                Join or create a study room
              </p>
            </div>
          </a>
          <a
            href="/leaderboard"
            className="glass-card-hover p-6 flex items-center gap-4"
          >
            <span className="text-3xl">🏆</span>
            <div>
              <h3 className="font-semibold text-white">Leaderboard</h3>
              <p className="text-sm text-gray-500">
                See top students
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
