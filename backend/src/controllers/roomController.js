const pool = require("../config/db");
const { activeTimers } = require("../sockets/roomSocket");

exports.createRoom = async (req, res) => {
  try {
    const { room_name, description } = req.body;

    const result = await pool.query(
      `INSERT INTO rooms
       (room_name, description, created_by)
       VALUES($1,$2,$3)
       RETURNING *`,
      [room_name, description, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    await pool.query(
      'INSERT INTO room_members (room_id, user_id) VALUES ($1, $2) ON CONFLICT (room_id, user_id) DO NOTHING',
      [roomId, req.user.id]
    );

    res.json({ message: 'Joined Room' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as creator_name, 
       (SELECT COUNT(*) FROM room_members rm WHERE rm.room_id = r.id) as member_count
       FROM rooms r 
       JOIN users u ON r.created_by = u.id
       ORDER BY r.created_at DESC`
    );
    const rooms = result.rows.map(room => ({
      ...room,
      timerActive: activeTimers.has(String(room.id))
    }));
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await pool.query(
      `SELECT r.*, u.name as creator_name FROM rooms r JOIN users u ON r.created_by = u.id WHERE r.id = $1`,
      [roomId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Room not found' });

    const room = result.rows[0];
    // Check if timer is active
    const timer = activeTimers.get(String(roomId));
    room.timerActive = !!timer;

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRoomMembers = async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.status, u.total_hours, u.streak FROM room_members rm JOIN users u ON rm.user_id = u.id WHERE rm.room_id = $1`,
      [roomId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    await pool.query('DELETE FROM room_members WHERE room_id = $1 AND user_id = $2', [roomId, req.user.id]);
    res.json({ message: 'Left room' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await pool.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
    if (room.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    
    if (room.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this room' });
    }
    
    await pool.query('DELETE FROM rooms WHERE id = $1', [roomId]);
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
