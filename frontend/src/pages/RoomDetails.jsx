import { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import PomodoroTimer from "../components/PomodoroTimer";

const socket = io("http://localhost:5000");

export default function RoomDetails() {
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [room, setRoom] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Join socket room
    socket.emit("join-room", roomId);

    // Listen for messages
    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Fetch room info
    const fetchRoom = async () => {
      try {
        const res = await api.get("/rooms/all");
        const found = res.data.find((r) => r.id === parseInt(roomId));
        if (found) setRoom(found);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRoom();

    return () => {
      socket.off("receive-message");
    };
  }, [roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    socket.emit("send-message", {
      roomId,
      message: input,
      username: user?.name || "Anonymous",
      userId: user?.id,
      timestamp: new Date().toISOString(),
    });
    setInput("");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-10 px-4 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold gradient-text">
            {room?.room_name || "Study Room"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {room?.description || "Loading..."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-2 glass-card flex flex-col h-[600px]">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-white flex items-center gap-2">
                💬 Live Chat
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-600">
                  <div className="text-center">
                    <span className="text-4xl block mb-2">💬</span>
                    <p>No messages yet. Say hello!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.userId === user?.id;
                  return (
                    <div
                      key={i}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isMe
                            ? "bg-primary-600/30 border border-primary-500/20 rounded-br-sm"
                            : "bg-white/5 border border-white/10 rounded-bl-sm"
                        }`}
                      >
                        {!isMe && (
                          <p className="text-xs font-medium text-primary-400 mb-1">
                            {msg.username}
                          </p>
                        )}
                        <p className="text-sm text-gray-200">{msg.message}</p>
                        <p className="text-[10px] text-gray-600 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button type="submit" className="btn-primary px-5">
                  Send
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar - Timer */}
          <div className="space-y-6">
            <PomodoroTimer roomId={roomId} />
          </div>
        </div>
      </div>
    </div>
  );
}
