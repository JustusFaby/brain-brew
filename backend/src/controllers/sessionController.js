const pool = require("../config/db");

exports.startSession = async (req, res) => {

  const { roomId } = req.body;

  // Update user status to studying
  await pool.query(
    `UPDATE users SET status='studying' WHERE id=$1`,
    [req.user.id]
  );

  const result = await pool.query(
    `INSERT INTO study_sessions
     (user_id, room_id, start_time)
     VALUES ($1,$2,NOW())
     RETURNING *`,
    [req.user.id, roomId]
  );

  res.json(result.rows[0]);
};

exports.endSession = async (req, res) => {

  const sessionId = req.params.sessionId;

  const result = await pool.query(
    `
    UPDATE study_sessions
    SET
      end_time = NOW(),
      duration_minutes =
      EXTRACT(
        EPOCH FROM (
          NOW() - start_time
        )
      ) / 60
    WHERE id=$1
    RETURNING *
    `,
    [sessionId]
  );

  // Update user total hours
  await pool.query(
    `
    UPDATE users
    SET total_hours =
    total_hours +
    $1
    WHERE id=$2
    `,
    [
      result.rows[0].duration_minutes,
      req.user.id
    ]
  );

  // Update streak if studied today
  const streakCheck = await pool.query(
    `SELECT COUNT(*) FROM study_sessions
     WHERE user_id=$1
     AND DATE(created_at)=CURRENT_DATE`,
    [req.user.id]
  );

  if (parseInt(streakCheck.rows[0].count) === 1) {
    await pool.query(
      `UPDATE users SET streak = streak + 1 WHERE id=$1`,
      [req.user.id]
    );
  }

  // Update user status to idle
  await pool.query(
    `UPDATE users SET status='idle' WHERE id=$1`,
    [req.user.id]
  );

  res.json(result.rows[0]);
};

exports.getAnalytics = async (req, res) => {

  const userId = req.user.id;

  const today = await pool.query(
    `SELECT COALESCE(SUM(duration_minutes),0) as hours
     FROM study_sessions
     WHERE user_id=$1
     AND DATE(created_at)=CURRENT_DATE`,
    [userId]
  );

  const weekly = await pool.query(
    `SELECT COALESCE(SUM(duration_minutes),0) as hours
     FROM study_sessions
     WHERE user_id=$1
     AND created_at >= CURRENT_DATE - INTERVAL '7 days'`,
    [userId]
  );

  const monthly = await pool.query(
    `SELECT COALESCE(SUM(duration_minutes),0) as hours
     FROM study_sessions
     WHERE user_id=$1
     AND created_at >= CURRENT_DATE - INTERVAL '30 days'`,
    [userId]
  );

  res.json({
    todayMinutes: parseFloat(today.rows[0].hours),
    weeklyMinutes: parseFloat(weekly.rows[0].hours),
    monthlyMinutes: parseFloat(monthly.rows[0].hours),
  });
};

exports.getLeaderboard = async (req, res) => {

  const result = await pool.query(
    `SELECT id, name, total_hours
     FROM users
     ORDER BY total_hours DESC
     LIMIT 10`
  );

  res.json(result.rows);
};

exports.getDashboard = async (req, res) => {

  const userId = req.user.id;

  const today = await pool.query(
    `SELECT COALESCE(SUM(duration_minutes),0) as hours
     FROM study_sessions
     WHERE user_id=$1
     AND DATE(created_at)=CURRENT_DATE`,
    [userId]
  );

  const weekly = await pool.query(
    `SELECT COALESCE(SUM(duration_minutes),0) as hours
     FROM study_sessions
     WHERE user_id=$1
     AND created_at >= CURRENT_DATE - INTERVAL '7 days'`,
    [userId]
  );

  const monthly = await pool.query(
    `SELECT COALESCE(SUM(duration_minutes),0) as hours
     FROM study_sessions
     WHERE user_id=$1
     AND created_at >= CURRENT_DATE - INTERVAL '30 days'`,
    [userId]
  );

  const user = await pool.query(
    `SELECT streak, status FROM users WHERE id=$1`,
    [userId]
  );

  const rank = await pool.query(
    `SELECT COUNT(*)+1 as rank
     FROM users
     WHERE total_hours > (
       SELECT total_hours FROM users WHERE id=$1
     )`,
    [userId]
  );

  res.json({
    todayHours: parseFloat(today.rows[0].hours),
    weeklyHours: parseFloat(weekly.rows[0].hours),
    monthlyHours: parseFloat(monthly.rows[0].hours),
    streak: user.rows[0].streak,
    status: user.rows[0].status,
    rank: parseInt(rank.rows[0].rank),
  });
};
