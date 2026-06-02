import { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import PomodoroTimer from "../components/PomodoroTimer";

export default function RoomDetails() {
  const { roomId } = useParams();
  const { user, isStudying } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const handleDeleteRoom = async () => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await api.delete(`/rooms/${roomId}`);
        navigate("/rooms");
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("token") },
    });
    socketRef.current = socket;
    socket.emit("join-room", roomId);
    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    socket.on("member-joined", (data) => {
      fetchMembers();
    });
    socket.on("member-left", (data) => {
      fetchMembers();
    });
    socket.on("error-message", (data) => {
      console.error("Socket error:", data.message);
    });
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}`);
        setRoom(res.data);
        setIsCreator(res.data.created_by == user?.id);
      } catch (err) {
        try {
          const res = await api.get("/rooms/all");
          const found = res.data.find((r) => r.id === parseInt(roomId));
          if (found) {
            setRoom(found);
            setIsCreator(found.created_by == user?.id);
          }
        } catch (e) {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    };
    const fetchDocuments = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}/documents`);
        setDocuments(res.data);
      } catch (err) {
        console.error("Failed to fetch documents", err);
      }
    };
    fetchRoom();
    fetchMembers();
    fetchDocuments();
    return () => {
      socket.emit("leave-room", roomId);
      socket.off("receive-message");
      socket.off("member-joined");
      socket.off("member-left");
      socket.off("error-message");
      socket.disconnect();
    };
  }, [roomId, user?.id]);

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/rooms/${roomId}/members`);
      setMembers(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit("send-message", {
      roomId,
      message: input,
      username: user?.name || "Anonymous",
      userId: user?.id,
      timestamp: new Date().toISOString(),
    });
    setInput("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("document", file);

    setUploadingDoc(true);
    try {
      const res = await api.post(`/rooms/${roomId}/documents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Try to fetch documents again to get uploader_name populated or just append. Let's fetch to be safe.
      const docRes = await api.get(`/rooms/${roomId}/documents`);
      setDocuments(docRes.data);
    } catch (err) {
      console.error("Upload error", err);
      alert("Failed to upload document. Ensure AWS S3 is configured.");
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen ambient-bg">
        <Navbar />
        <div className="pt-24 pb-10 px-4 max-w-7xl mx-auto relative z-10">
          <div className="glass-card p-8 animate-pulse">
            <div className="h-6 bg-coffee-100/50 rounded w-1/3 mb-3" />
            <div className="h-4 bg-coffee-100/50 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ambient-bg">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto relative z-10">
        {isStudying && (
          <div className="mb-4 bg-coffee-100 border border-coffee-300/40 rounded-xl px-4 py-2.5 flex items-center gap-2 animate-fade-in">
            <span className="w-2 h-2 bg-coffee-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-coffee-500">
              🔒 Study session in progress — stay focused!
            </span>
          </div>
        )}

        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold gradient-text">
              {room?.room_name || "Study Room"}
            </h1>
            <p className="text-dark-500 text-sm mt-1">
              {room?.description || "A focused study space"}
            </p>
          </div>
          {isCreator && (
            <button
              onClick={handleDeleteRoom}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors"
            >
              Delete Room
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
            <div className="p-4 border-b border-coffee-200/40">
              <h2 className="font-semibold text-coffee-900 flex items-center gap-2">
                💬 Live Chat
                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                  Live
                </span>
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-dark-500">
                  <div className="text-center">
                    <span className="text-4xl block mb-3">💬</span>
                    <p className="text-dark-500">No messages yet. Say hello!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.userId === user?.id;
                  return (
                    <div
                      key={i}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} animate-slide-up`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isMe
                            ? "bg-coffee-100 border border-coffee-200/50 rounded-br-md"
                            : "bg-cream-100 border border-coffee-200/40 rounded-bl-md"
                        }`}
                      >
                        {!isMe && (
                          <p className="text-xs font-medium text-coffee-500 mb-1">
                            {msg.username}
                          </p>
                        )}
                        <p className="text-sm text-coffee-800">{msg.message}</p>
                        <p className="text-[10px] text-dark-500 mt-1">
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

            <form onSubmit={sendMessage} className="p-4 border-t border-coffee-200/40">
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

          <div className="space-y-6">
            <PomodoroTimer
              roomId={roomId}
              isCreator={isCreator}
              socket={socketRef.current}
            />

            <div className="glass-card p-5">
              <h3 className="font-semibold text-coffee-900 mb-4 flex items-center gap-2">
                👥 Members
                <span className="text-xs bg-cream-200 text-dark-400 px-2 py-0.5 rounded-full">
                  {members.length}
                </span>
              </h3>
              <div className="space-y-2.5">
                {members.length > 0 ? (
                  members.map((member, i) => (
                    <div
                      key={member.id || i}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-coffee-50/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-500 flex items-center justify-center text-white text-xs font-bold">
                        {member.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-coffee-900 font-medium truncate">
                          {member.name}
                          {member.id === user?.id && (
                            <span className="text-dark-500 ml-1">(You)</span>
                          )}
                        </p>
                      </div>
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-dark-500 text-center py-2">
                    Loading members...
                  </p>
                )}
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="font-semibold text-coffee-900 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  📄 Documents
                  <span className="text-xs bg-cream-200 text-dark-400 px-2 py-0.5 rounded-full">
                    {documents.length}
                  </span>
                </div>
                <div>
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingDoc}
                    className="text-xs px-3 py-1.5 bg-coffee-100 text-coffee-700 rounded hover:bg-coffee-200 transition-colors"
                  >
                    {uploadingDoc ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </h3>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                {documents.length > 0 ? (
                  documents.map((doc, i) => (
                    <div
                      key={doc.id || i}
                      className="flex items-center justify-between p-2 rounded-lg border border-coffee-200/50 hover:bg-coffee-50/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-coffee-800 font-medium truncate hover:underline block"
                        >
                          {doc.file_name}
                        </a>
                        <p className="text-[10px] text-dark-500 mt-0.5">
                          Uploaded by {doc.uploader_name || "Unknown"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-dark-500 text-center py-2">
                    No documents uploaded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
