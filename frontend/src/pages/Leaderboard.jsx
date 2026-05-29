import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get("/session/leaderboard");
        setLeaders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const medals = ["🥇", "🥈", "🥉"];
  const rankColors = [
    "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
    "from-gray-300/10 to-gray-400/10 border-gray-400/20",
    "from-orange-600/10 to-amber-700/10 border-orange-600/20",
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-10 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🏆</span>
          <h1 className="text-3xl font-bold gradient-text">Leaderboard</h1>
          <p className="text-gray-500 mt-1">Top students by study hours</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-white/5 rounded-full" />
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                  <div className="ml-auto h-4 bg-white/5 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {leaders.map((leader, i) => {
              const isMe = leader.id === user?.id;
              return (
                <div
                  key={leader.id}
                  className={`glass-card p-5 flex items-center gap-4 transition-all duration-300 ${
                    i < 3
                      ? `bg-gradient-to-r ${rankColors[i]} border`
                      : "hover:bg-white/5"
                  } ${isMe ? "ring-1 ring-primary-500/40" : ""}`}
                >
                  <span className="text-2xl w-10 text-center">
                    {i < 3 ? medals[i] : `#${i + 1}`}
                  </span>

                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {leader.name?.charAt(0)?.toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <p className={`font-semibold ${isMe ? "text-primary-300" : "text-white"}`}>
                      {leader.name} {isMe && "(You)"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      {leader.total_hours}
                    </p>
                    <p className="text-xs text-gray-500">minutes</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
