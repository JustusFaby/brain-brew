import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ room_name: "", description: "" });
  const [loading, setLoading] = useState(true);
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

  const roomColors = [
    "from-primary-600/20 to-violet-600/20",
    "from-blue-600/20 to-cyan-600/20",
    "from-emerald-600/20 to-green-600/20",
    "from-orange-600/20 to-amber-600/20",
    "from-pink-600/20 to-rose-600/20",
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-10 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Study Rooms</h1>
            <p className="text-gray-500 mt-1">Join a room and start studying</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
            + Create Room
          </button>
        </div>

        {/* Create room form */}
        {showCreate && (
          <div className="glass-card p-6 mb-6 animate-[fadeIn_0.3s_ease]">
            <h3 className="text-lg font-semibold mb-4 text-white">Create New Room</h3>
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
                placeholder="Description"
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Create
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-5 bg-white/5 rounded w-2/3 mb-3" />
                <div className="h-4 bg-white/5 rounded w-full mb-4" />
                <div className="h-10 bg-white/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <span className="text-5xl block mb-4">🏠</span>
            <h3 className="text-xl font-semibold text-white mb-2">No rooms yet</h3>
            <p className="text-gray-500">Create the first study room!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room, i) => (
              <div
                key={room.id}
                className="glass-card-hover overflow-hidden group"
              >
                <div className={`h-2 bg-gradient-to-r ${roomColors[i % roomColors.length]}`} />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary-300 transition-colors">
                    {room.room_name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {room.description || "No description"}
                  </p>
                  <button
                    onClick={() => joinRoom(room.id)}
                    className="btn-secondary text-sm py-2 px-4"
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
