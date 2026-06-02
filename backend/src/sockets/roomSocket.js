const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// In-memory timer state per room
const activeTimers = new Map();

function roomSocket(io) {
  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey');
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected (socket: ${socket.id})`);

    // --- ROOM JOIN ---
    socket.on('join-room', async (roomId) => {
      socket.join(`room-${roomId}`);
      socket.currentRoom = roomId;
      console.log(`User ${socket.userId} joined room ${roomId}`);

      // Notify room about new member
      io.to(`room-${roomId}`).emit('member-joined', { userId: socket.userId });

      // If there's an active timer, send current state to the joining user
      const timer = activeTimers.get(String(roomId));
      if (timer) {
        const now = Date.now();
        let timeLeft;
        if (timer.paused) {
          timeLeft = timer.remainingOnPause;
        } else {
          timeLeft = Math.max(0, Math.ceil((timer.endTime - now) / 1000));
        }
        socket.emit('timer-sync', {
          timeLeft,
          totalDuration: timer.duration,
          mode: timer.mode,
          isRunning: !timer.paused,
          creatorId: timer.creatorId
        });
      }
    });

    // --- LEAVE ROOM ---
    socket.on('leave-room', (roomId) => {
      socket.leave(`room-${roomId}`);
      socket.currentRoom = null;
      io.to(`room-${roomId}`).emit('member-left', { userId: socket.userId });
    });

    // --- START TIMER (creator only) ---
    socket.on('start-timer', async ({ roomId, duration, mode }) => {
      const rid = String(roomId);

      // Verify this user is the room creator
      try {
        const result = await pool.query('SELECT created_by FROM rooms WHERE id = $1', [roomId]);
        if (result.rows.length === 0 || result.rows[0].created_by !== socket.userId) {
          socket.emit('error-message', { message: 'Only the room creator can control the timer' });
          return;
        }
      } catch (err) {
        console.error('Error verifying room creator:', err);
        return;
      }

      // Clear any existing timer for this room
      if (activeTimers.has(rid)) {
        clearInterval(activeTimers.get(rid).interval);
      }

      const endTime = Date.now() + duration * 1000;

      // Start server-side study sessions for all connected users in the room
      const socketsInRoom = await io.in(`room-${roomId}`).fetchSockets();
      const sessionIds = {};
      for (const s of socketsInRoom) {
        try {
          // End any orphaned sessions first
          await pool.query(
            `UPDATE study_sessions SET end_time = NOW(), duration_minutes = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60 WHERE user_id = $1 AND end_time IS NULL`,
            [s.userId]
          );
          // Start new session
          const sess = await pool.query(
            'INSERT INTO study_sessions (user_id, room_id, start_time) VALUES ($1, $2, NOW()) RETURNING id',
            [s.userId, roomId]
          );
          sessionIds[s.userId] = sess.rows[0].id;
          // Set user status to studying
          await pool.query("UPDATE users SET status = 'studying' WHERE id = $1", [s.userId]);
        } catch (err) {
          console.error(`Error starting session for user ${s.userId}:`, err);
        }
      }

      // Create the server-side interval
      const interval = setInterval(() => {
        const timer = activeTimers.get(rid);
        if (!timer || timer.paused) return;

        const now = Date.now();
        const timeLeft = Math.max(0, Math.ceil((timer.endTime - now) / 1000));

        io.to(`room-${roomId}`).emit('timer-tick', {
          timeLeft,
          totalDuration: timer.duration,
          mode: timer.mode
        });

        if (timeLeft <= 0) {
          clearInterval(timer.interval);
          activeTimers.delete(rid);
          endAllSessions(roomId, timer.sessionIds, io);
          io.to(`room-${roomId}`).emit('timer-complete', { mode: timer.mode });
        }
      }, 1000);

      activeTimers.set(rid, {
        endTime,
        duration,
        interval,
        paused: false,
        remainingOnPause: 0,
        creatorId: socket.userId,
        mode,
        sessionIds
      });

      // Broadcast timer started to all room members
      io.to(`room-${roomId}`).emit('timer-started', {
        timeLeft: duration,
        totalDuration: duration,
        mode,
        creatorId: socket.userId
      });

      console.log(`Timer started in room ${roomId}: ${duration}s (${mode}) by user ${socket.userId}`);
    });

    // --- PAUSE TIMER (creator only) ---
    socket.on('pause-timer', async ({ roomId }) => {
      const rid = String(roomId);
      const timer = activeTimers.get(rid);
      if (!timer || timer.creatorId !== socket.userId || timer.paused) return;

      timer.paused = true;
      timer.remainingOnPause = Math.max(0, Math.ceil((timer.endTime - Date.now()) / 1000));
      clearInterval(timer.interval);

      io.to(`room-${roomId}`).emit('timer-paused', {
        timeLeft: timer.remainingOnPause,
        totalDuration: timer.duration,
        mode: timer.mode
      });

      console.log(`Timer paused in room ${roomId}`);
    });

    // --- RESUME TIMER (creator only) ---
    socket.on('resume-timer', async ({ roomId }) => {
      const rid = String(roomId);
      const timer = activeTimers.get(rid);
      if (!timer || timer.creatorId !== socket.userId || !timer.paused) return;

      timer.paused = false;
      timer.endTime = Date.now() + timer.remainingOnPause * 1000;

      const interval = setInterval(() => {
        const t = activeTimers.get(rid);
        if (!t || t.paused) return;

        const now = Date.now();
        const timeLeft = Math.max(0, Math.ceil((t.endTime - now) / 1000));

        io.to(`room-${roomId}`).emit('timer-tick', {
          timeLeft,
          totalDuration: t.duration,
          mode: t.mode
        });

        if (timeLeft <= 0) {
          clearInterval(t.interval);
          activeTimers.delete(rid);
          endAllSessions(roomId, t.sessionIds, io);
          io.to(`room-${roomId}`).emit('timer-complete', { mode: t.mode });
        }
      }, 1000);

      timer.interval = interval;

      io.to(`room-${roomId}`).emit('timer-resumed', {
        timeLeft: timer.remainingOnPause,
        totalDuration: timer.duration,
        mode: timer.mode
      });

      console.log(`Timer resumed in room ${roomId}`);
    });

    // --- STOP TIMER (creator only) ---
    socket.on('stop-timer', async ({ roomId }) => {
      const rid = String(roomId);
      const timer = activeTimers.get(rid);
      if (!timer || timer.creatorId !== socket.userId) return;

      clearInterval(timer.interval);
      activeTimers.delete(rid);

      await endAllSessions(roomId, timer.sessionIds, io);

      io.to(`room-${roomId}`).emit('timer-stopped', { mode: timer.mode });

      console.log(`Timer stopped in room ${roomId} by creator`);
    });

    // --- CHAT ---
    socket.on('send-message', (data) => {
      io.to(`room-${data.roomId}`).emit('receive-message', data);
    });

    // --- DISCONNECT ---
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected (socket: ${socket.id})`);
      if (socket.currentRoom) {
        io.to(`room-${socket.currentRoom}`).emit('member-left', { userId: socket.userId });
      }
    });
  });
}

// Helper: end all sessions for a room's timer
async function endAllSessions(roomId, sessionIds, io) {
  for (const [userId, sessionId] of Object.entries(sessionIds)) {
    try {
      await pool.query(
        `UPDATE study_sessions SET end_time = NOW(), duration_minutes = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60 WHERE id = $1 AND end_time IS NULL`,
        [sessionId]
      );
      // Update user total_hours and status
      const sessionResult = await pool.query('SELECT duration_minutes FROM study_sessions WHERE id = $1', [sessionId]);
      if (sessionResult.rows.length > 0 && sessionResult.rows[0].duration_minutes) {
        await pool.query(
          'UPDATE users SET total_hours = total_hours + $1, status = $2 WHERE id = $3',
          [sessionResult.rows[0].duration_minutes, 'idle', userId]
        );
      } else {
        await pool.query("UPDATE users SET status = 'idle' WHERE id = $1", [userId]);
      }
      // Update streak
      const today = new Date().toISOString().split('T')[0];
      const streakResult = await pool.query('SELECT last_study_date, streak FROM users WHERE id = $1', [userId]);
      if (streakResult.rows.length > 0) {
        const { last_study_date, streak } = streakResult.rows[0];
        const lastDate = last_study_date ? new Date(last_study_date).toISOString().split('T')[0] : null;
        if (lastDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          const newStreak = lastDate === yesterday ? streak + 1 : 1;
          await pool.query('UPDATE users SET streak = $1, last_study_date = $2 WHERE id = $3', [newStreak, today, userId]);
        }
      }
    } catch (err) {
      console.error(`Error ending session ${sessionId} for user ${userId}:`, err);
    }
  }
}

// Export activeTimers so it can be queried by REST endpoints
module.exports = { roomSocket, activeTimers };
