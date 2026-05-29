import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function PomodoroTimer({ roomId }) {
  const { setIsStudying } = useContext(AuthContext);
  const [mode, setMode] = useState("focus"); // focus | break
  const [duration, setDuration] = useState(25 * 60); // seconds
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const intervalRef = useRef(null);

  const modes = {
    focus: { time: 25 * 60, label: "Focus", color: "from-primary-500 to-violet-500" },
    longFocus: { time: 50 * 60, label: "Deep Focus", color: "from-blue-500 to-cyan-500" },
    break: { time: 5 * 60, label: "Break", color: "from-emerald-500 to-green-500" },
    longBreak: { time: 10 * 60, label: "Long Break", color: "from-orange-500 to-amber-500" },
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (sessionId) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sessionId]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleStart = async () => {
    setIsRunning(true);
    if (mode === "focus" || mode === "longFocus") {
      try {
        const res = await api.post("/session/start", { roomId: parseInt(roomId) });
        setSessionId(res.data.id);
        setIsStudying(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  const handleReset = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setTimeLeft(duration);
    setSessionId(null);
    setIsStudying(false);
  };

  const handleComplete = async () => {
    setIsRunning(false);
    if (sessionId) {
      try {
        await api.post(`/session/end/${sessionId}`);
        setSessionId(null);
        setIsStudying(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const selectMode = (key) => {
    if (isRunning) return;
    setMode(key);
    setDuration(modes[key].time);
    setTimeLeft(modes[key].time);
    setSessionId(null);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((duration - timeLeft) / duration) * 100;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        ⏱️ Pomodoro Timer
      </h3>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {Object.entries(modes).map(([key, val]) => (
          <button
            key={key}
            onClick={() => selectMode(key)}
            className={`text-xs py-2 px-3 rounded-lg font-medium transition-all ${
              mode === key
                ? `bg-gradient-to-r ${val.color} text-white`
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Circular timer */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="url(#gradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-xs text-gray-500 mt-1 capitalize">{modes[mode].label}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isRunning ? (
          <button onClick={handleStart} className="btn-primary flex-1 py-3">
            {timeLeft === duration ? "Start" : "Resume"}
          </button>
        ) : (
          <button onClick={handlePause} className="btn-secondary flex-1 py-3">
            Pause
          </button>
        )}
        <button onClick={handleReset} className="btn-secondary px-4 py-3">
          ↺
        </button>
      </div>

      {sessionId && (
        <p className="text-xs text-primary-400 text-center mt-3 animate-pulse">
          🟢 Session active
        </p>
      )}
    </div>
  );
}
