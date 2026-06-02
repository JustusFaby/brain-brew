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
  const podiumColors = [
    "from-amber-100/60 to-yellow-100/60 border-amber-300/30",
    "from-gray-100/60 to-gray-200/60 border-gray-300/30",
    "from-orange-100/60 to-amber-100/60 border-orange-300/30",
  ];
  const podiumGradients = [
    "from-yellow-400 to-amber-400",
    "from-gray-300 to-gray-400",
    "from-orange-400 to-amber-500",
  ];

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="min-h-screen ambient-bg">
      <Navbar />
      <div className="pt-24 pb-10 px-4 max-w-3xl mx-auto relative z-10 page-enter">
        <div className="text-center mb-10">
          <span className="text-5xl block mb-3">🏆</span>
          <h1 className="text-3xl font-bold gradient-text">Leaderboard</h1>
          <p className="text-dark-500 mt-1">Top students by study minutes</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card p-5">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 skeleton rounded-full" />
                  <div className="h-4 skeleton rounded w-1/3" />
                  <div className="ml-auto h-4 skeleton rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {top3[1] ? (
                  <div className={`glass-card bg-gradient-to-b ${podiumColors[1]} p-5 text-center pt-8 self-end`}>
                    <span className="text-3xl block mb-2">🥈</span>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-coffee-900 font-bold text-lg mx-auto mb-2">
                      {top3[1].name?.charAt(0)?.toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-coffee-900 truncate">{top3[1].name}</p>
                    <p className={`text-lg font-bold bg-gradient-to-r ${podiumGradients[1]} bg-clip-text text-transparent mt-1`}>
                      {Number(top3[1].total_hours || 0).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-dark-500">minutes</p>
                  </div>
                ) : <div />}

                {top3[0] ? (
                  <div className={`glass-card bg-gradient-to-b ${podiumColors[0]} p-5 text-center pt-6 border animate-breathe`}>
                    <span className="text-4xl block mb-2">🥇</span>
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-coffee-900 font-bold text-xl mx-auto mb-2 shadow-lg shadow-amber-500/30">
                      {top3[0].name?.charAt(0)?.toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-coffee-900 truncate">{top3[0].name}</p>
                    <p className={`text-xl font-bold bg-gradient-to-r ${podiumGradients[0]} bg-clip-text text-transparent mt-1`}>
                      {Number(top3[0].total_hours || 0).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-dark-500">minutes</p>
                  </div>
                ) : <div />}

                {top3[2] ? (
                  <div className={`glass-card bg-gradient-to-b ${podiumColors[2]} p-5 text-center pt-10 self-end`}>
                    <span className="text-3xl block mb-2">🥉</span>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-coffee-900 font-bold text-lg mx-auto mb-2">
                      {top3[2].name?.charAt(0)?.toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-coffee-900 truncate">{top3[2].name}</p>
                    <p className={`text-lg font-bold bg-gradient-to-r ${podiumGradients[2]} bg-clip-text text-transparent mt-1`}>
                      {Number(top3[2].total_hours || 0).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-dark-500">minutes</p>
                  </div>
                ) : <div />}
              </div>
            )}

            {rest.length > 0 && (
              <div className="space-y-2">
                {rest.map((leader, i) => {
                  const rank = i + 4;
                  const isMe = leader.id === user?.id;
                  return (
                    <div
                      key={leader.id}
                      className={`glass-card p-4 flex items-center gap-4 transition-all duration-300 hover:bg-coffee-50/50 ${
                        isMe ? "ring-1 ring-coffee-400/30 bg-coffee-50" : ""
                      }`}
                    >
                      <span className="text-sm font-bold text-dark-500 w-8 text-center">
                        #{rank}
                      </span>

                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-500 flex items-center justify-center text-white font-bold text-sm">
                        {leader.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isMe ? "text-coffee-500" : "text-coffee-900"}`}>
                          {leader.name} {isMe && "(You)"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-bold text-coffee-900">
                          {Number(leader.total_hours || 0).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-dark-500">minutes</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {leaders.length === 0 && (
              <div className="glass-card p-16 text-center">
                <span className="text-5xl block mb-4">🏆</span>
                <h3 className="text-xl font-semibold text-coffee-900 mb-2">No data yet</h3>
                <p className="text-dark-500">Start studying to appear on the leaderboard!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
