import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const MODES = {
  focus: { label: "Focus", duration: 1500 },
  longFocus: { label: "Deep Focus", duration: 3000 },
  break: { label: "Break", duration: 300 },
  longBreak: { label: "Long Break", duration: 600 },
};

export default function PomodoroTimer({ roomId, isCreator, socket }) {
  const { setIsStudying, setCurrentRoomId } = useContext(AuthContext);

  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [totalDuration, setTotalDuration] = useState(MODES.focus.duration);
  const [mode, setMode] = useState("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const onTimerStarted = (data) => {
      setTimeLeft(data.timeLeft);
      setTotalDuration(data.totalDuration);
      setMode(data.mode);
      setIsRunning(true);
      setIsPaused(false);
      setIsStudying(true);
      setCurrentRoomId(roomId);
    };

    const onTimerTick = (data) => {
      setTimeLeft(data.timeLeft);
      setTotalDuration(data.totalDuration);
      setMode(data.mode);
    };

    const onTimerPaused = (data) => {
      setTimeLeft(data.timeLeft);
      setTotalDuration(data.totalDuration);
      setMode(data.mode);
      setIsRunning(false);
      setIsPaused(true);
    };

    const onTimerResumed = (data) => {
      setTimeLeft(data.timeLeft);
      setTotalDuration(data.totalDuration);
      setMode(data.mode);
      setIsRunning(true);
      setIsPaused(false);
    };

    const onTimerStopped = (data) => {
      resetTimerState(data.mode || "focus");
      setIsStudying(false);
      setCurrentRoomId(null);
    };

    const onTimerComplete = (data) => {
      resetTimerState(data.mode || "focus");
      setIsStudying(false);
      setCurrentRoomId(null);
      setShowComplete(true);
      setTimeout(() => setShowComplete(false), 4000);
    };

    const onTimerSync = (data) => {
      setTimeLeft(data.timeLeft);
      setTotalDuration(data.totalDuration);
      setMode(data.mode);
      setIsRunning(data.isRunning);
      setIsPaused(!data.isRunning && data.timeLeft < data.totalDuration);
      if (data.isRunning) {
        setIsStudying(true);
        setCurrentRoomId(roomId);
      }
    };

    socket.on("timer-started", onTimerStarted);
    socket.on("timer-tick", onTimerTick);
    socket.on("timer-paused", onTimerPaused);
    socket.on("timer-resumed", onTimerResumed);
    socket.on("timer-stopped", onTimerStopped);
    socket.on("timer-complete", onTimerComplete);
    socket.on("timer-sync", onTimerSync);

    return () => {
      socket.off("timer-started", onTimerStarted);
      socket.off("timer-tick", onTimerTick);
      socket.off("timer-paused", onTimerPaused);
      socket.off("timer-resumed", onTimerResumed);
      socket.off("timer-stopped", onTimerStopped);
      socket.off("timer-complete", onTimerComplete);
      socket.off("timer-sync", onTimerSync);
    };
  }, [socket, roomId, setIsStudying, setCurrentRoomId]);

  const resetTimerState = (newMode) => {
    const m = newMode || "focus";
    setMode(m);
    setTimeLeft(MODES[m]?.duration || 1500);
    setTotalDuration(MODES[m]?.duration || 1500);
    setIsRunning(false);
    setIsPaused(false);
  };

  const handleStart = () => {
    if (!socket || !isCreator) return;
    socket.emit("start-timer", {
      roomId,
      duration: MODES[mode].duration,
      mode,
    });
  };

  const handlePause = () => {
    if (!socket || !isCreator) return;
    socket.emit("pause-timer", { roomId });
  };

  const handleResume = () => {
    if (!socket || !isCreator) return;
    socket.emit("resume-timer", { roomId });
  };

  const handleStop = () => {
    if (!socket || !isCreator) return;
    socket.emit("stop-timer", { roomId });
  };

  const selectMode = (key) => {
    if (isRunning || isPaused || !isCreator) return;
    setMode(key);
    setTimeLeft(MODES[key].duration);
    setTotalDuration(MODES[key].duration);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;

  const radius = 125;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const isTimerActive = isRunning || isPaused;
  const isFocusMode = mode === "focus" || mode === "longFocus";

  const gradientColors = isFocusMode
    ? { start: "#8B5E3C", end: "#6B4226" }
    : { start: "#A8724E", end: "#7A4F30" };

  const glowClass = isRunning
    ? isFocusMode
      ? "timer-glow"
      : "timer-glow-focus"
    : "";

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {showComplete && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-2xl animate-fade-in">
          <div className="text-center">
            <span className="text-5xl block mb-3">🎉</span>
            <h3 className="text-xl font-bold text-coffee-500 mb-1">Session Complete!</h3>
            <p className="text-dark-400 text-sm">Great work, take a break.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-coffee-900 flex items-center gap-2">
          ⏱️ Pomodoro Timer
        </h3>
        {isRunning && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Active
          </span>
        )}
        {isPaused && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-coffee-500 bg-coffee-100 px-2.5 py-1 rounded-full">
            Paused
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {Object.entries(MODES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => selectMode(key)}
            disabled={isTimerActive || !isCreator}
            className={`text-xs py-2.5 px-3 rounded-lg font-medium transition-all duration-200 ${
              mode === key
                ? isFocusMode && (key === "focus" || key === "longFocus")
                  ? "bg-gradient-to-r from-coffee-500 to-coffee-600 text-white shadow-lg shadow-coffee-500/20"
                  : !isFocusMode && (key === "break" || key === "longBreak")
                  ? "bg-gradient-to-r from-focus-500 to-focus-600 text-white shadow-lg shadow-focus-500/20"
                  : mode === key
                  ? "bg-gradient-to-r from-coffee-500 to-coffee-600 text-white shadow-lg shadow-coffee-500/20"
                  : "bg-cream-200/80 text-dark-400"
                : "bg-cream-200/80 text-dark-400 hover:bg-cream-300 hover:text-coffee-700"
            } ${(isTimerActive || !isCreator) ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {val.label}
          </button>
        ))}
      </div>

      <div className="flex justify-center mb-6">
        <div className={`relative w-[280px] h-[280px] ${glowClass}`}>
          <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="rgba(139,94,60,0.08)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke={`url(#timer-gradient-${roomId})`}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id={`timer-gradient-${roomId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={gradientColors.start} />
                <stop offset="100%" stopColor={gradientColors.end} />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-coffee-900 tabular-nums tracking-tight font-mono">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className={`text-sm mt-2 font-medium ${isFocusMode ? "text-coffee-500" : "text-focus-500"}`}>
              {MODES[mode]?.label || "Focus"}
            </span>
          </div>
        </div>
      </div>

      {isCreator ? (
        <div className="flex gap-2">
          {!isRunning && !isPaused && (
            <button onClick={handleStart} className="btn-primary flex-1 py-3 text-sm">
              ▶ Start
            </button>
          )}
          {isRunning && (
            <>
              <button onClick={handlePause} className="btn-secondary flex-1 py-3 text-sm">
                ⏸ Pause
              </button>
              <button
                onClick={handleStop}
                className="bg-red-50 border border-red-200 text-red-600 font-medium py-3 px-4 rounded-xl transition-all duration-300 hover:bg-red-100 text-sm"
              >
                ⏹ Stop
              </button>
            </>
          )}
          {isPaused && !isRunning && (
            <>
              <button onClick={handleResume} className="btn-primary flex-1 py-3 text-sm">
                ▶ Resume
              </button>
              <button
                onClick={handleStop}
                className="bg-red-50 border border-red-200 text-red-600 font-medium py-3 px-4 rounded-xl transition-all duration-300 hover:bg-red-100 text-sm"
              >
                ⏹ Stop
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="text-center">
          {isTimerActive ? (
            <p className="text-sm text-dark-400">
              <span className="text-focus-500 font-medium">Session in progress</span> — controlled by room creator
            </p>
          ) : (
            <p className="text-sm text-dark-500">Waiting for the room creator to start a session...</p>
          )}
        </div>
      )}

      {isRunning && (
        <p className="text-xs text-center mt-4 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-600 font-medium">Session active</span>
        </p>
      )}
    </div>
  );
}
