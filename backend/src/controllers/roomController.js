const pool = require("../config/db");

exports.createRoom = async (req, res) => {

  const { room_name, description } = req.body;

  const result = await pool.query(
    `INSERT INTO rooms
     (room_name, description, created_by)
     VALUES($1,$2,$3)
     RETURNING *`,
    [room_name, description, req.user.id]
  );

  res.status(201).json(result.rows[0]);
};

exports.joinRoom = async (req, res) => {

  const roomId = req.params.roomId;

  await pool.query(
    `INSERT INTO room_members
     (room_id,user_id)
     VALUES($1,$2)`,
    [roomId, req.user.id]
  );

  res.json({
    message: "Joined Room"
  });
};

exports.getRooms = async (req,res)=>{

 const result = await pool.query(
   `SELECT * FROM rooms`
 );

 res.json(result.rows);

}
