import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ room_name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms/all");
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const createRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post("/rooms/create", form);
      setForm({ room_name: "", description: "" });
      setShowCreate(false);
      fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  const joinRoom = async (roomId) => {
    try {
      await api.post(`/rooms/join/${roomId}`);
      navigate(`/room/${roomId}`);
    } catch (err) {
      navigate(`/room/${roomId}`);
    }
  };

  const deleteRoom = async (e, roomId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await api.delete(`/rooms/${roomId}`);
        fetchRooms();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const cardAccents = [
    "from-coffee-300/30 to-coffee-400/30",
    "from-focus-300/30 to-focus-400/30",
    "from-emerald-200/40 to-green-200/40",
    "from-blue-200/40 to-cyan-200/40",
    "from-rose-200/40 to-pink-200/40",
  ];

  return (
    <div className="min-h-screen ambient-bg">
      <Navbar />
      <div className="pt-24 pb-10 px-4 max-w-7xl mx-auto relative z-10 page-enter">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Study Rooms</h1>
            <p className="text-dark-500 mt-1">Join a room and start studying together</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn-primary flex items-center gap-2"
          >
            <span className="text-lg">+</span> Create Room
          </button>
        </div>

        {showCreate && (
          <div className="glass-card p-6 mb-6 animate-slide-up">
            <h3 className="text-lg font-semibold mb-4 text-coffee-900 flex items-center gap-2">
              ✨ Create New Room
            </h3>
            <form onSubmit={createRoom} className="flex flex-col sm:flex-row gap-3">
              <input
                value={form.room_name}
                onChange={(e) => setForm({ ...form, room_name: e.target.value })}
                placeholder="Room name"
                className="input-field flex-1"
                required
              />
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description (optional)"
                className="input-field flex-1"
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary whitespace-nowrap">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="btn-secondary whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-6">
                <div className="h-5 skeleton rounded w-2/3 mb-3" />
                <div className="h-4 skeleton rounded w-full mb-2" />
                <div className="h-4 skeleton rounded w-1/2 mb-4" />
                <div className="h-10 skeleton rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <span className="text-5xl block mb-4">🏠</span>
            <h3 className="text-xl font-semibold text-coffee-900 mb-2">No rooms yet</h3>
            <p className="text-dark-500 mb-6">Create the first study room and invite others!</p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary"
            >
              + Create Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room, i) => (
              <div
                key={room.id}
                className="glass-card-hover overflow-hidden group animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`h-1 bg-gradient-to-r ${cardAccents[i % cardAccents.length]}`} />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-coffee-900 group-hover:text-coffee-500 transition-colors">
                      {room.room_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {room.has_active_timer && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full animate-pulse">
                          🔴 LIVE
                        </span>
                      )}
                      {user && (room.created_by == user.id || room.creator_name === user.name) && (
                        <button
                          onClick={(e) => deleteRoom(e, room.id)}
                          className="text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                          title="Delete Room"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-dark-500 mb-3 line-clamp-2">
                    {room.description || "No description"}
                  </p>

                  <div className="flex items-center gap-3 mb-4">
                    {room.creator_name && (
                      <span className="text-xs text-dark-500 flex items-center gap-1">
                        👤 {room.creator_name}
                      </span>
                    )}
                    {room.member_count !== undefined && (
                      <span className="text-xs text-dark-500 flex items-center gap-1">
                        👥 {room.member_count} members
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => joinRoom(room.id)}
                    className="btn-secondary text-sm py-2 px-4 w-full group-hover:border-coffee-300/50 group-hover:text-coffee-500"
                  >
                    Join Room →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
