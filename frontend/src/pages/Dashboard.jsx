import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";

const quotes = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
  "Focus on being productive instead of busy. — Tim Ferriss",
  "Small daily improvements are the key to staggering long-term results. — Robin Sharma",
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Success is the sum of small efforts repeated day in and day out. — Robert Collier",
  "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
];

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

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
          accent: "from-coffee-400 to-coffee-500",
          bg: "bg-coffee-100",
        },
        {
          label: "Weekly Study",
          value: `${Math.round(data.weeklyHours)} min`,
          icon: "📅",
          accent: "from-emerald-400 to-green-400",
          bg: "bg-emerald-50",
        },
        {
          label: "Streak",
          value: `${data.streak} days`,
          icon: "🔥",
          accent: "from-red-400 to-orange-400",
          bg: "bg-red-50",
        },
        {
          label: "Rank",
          value: `#${data.rank}`,
          icon: "🏆",
          accent: "from-yellow-400 to-amber-400",
          bg: "bg-amber-50",
        },
      ]
    : [];

  return (
    <div className="min-h-screen ambient-bg">
      <Navbar />
      <div className="pt-24 pb-10 px-4 max-w-7xl mx-auto relative z-10 page-enter">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-900">
            Welcome back, <span className="gradient-text">{user?.name || "Learner"}</span>
          </h1>
          <p className="text-dark-500 mt-2 text-sm max-w-xl italic">"{quote}"</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-6">
                <div className="h-4 skeleton rounded w-1/2 mb-4" />
                <div className="h-8 skeleton rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="glass-card-hover p-6 group animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-dark-400">{stat.label}</span>
                  <span
                    className={`text-2xl w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    {stat.icon}
                  </span>
                </div>
                <p
                  className={`text-2xl font-bold bg-gradient-to-r ${stat.accent} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-coffee-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/rooms"
            className="glass-card-hover p-6 flex items-center gap-4 group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">🏠</span>
            <div>
              <h3 className="font-semibold text-coffee-900 group-hover:text-coffee-500 transition-colors">
                Join a Room
              </h3>
              <p className="text-sm text-dark-500">
                Find a study room and start learning
              </p>
            </div>
            <span className="ml-auto text-dark-500 group-hover:text-coffee-500 transition-colors">→</span>
          </Link>
          <Link
            to="/leaderboard"
            className="glass-card-hover p-6 flex items-center gap-4 group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">🏆</span>
            <div>
              <h3 className="font-semibold text-coffee-900 group-hover:text-coffee-500 transition-colors">
                View Leaderboard
              </h3>
              <p className="text-sm text-dark-500">
                See top students and your ranking
              </p>
            </div>
            <span className="ml-auto text-dark-500 group-hover:text-coffee-500 transition-colors">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
