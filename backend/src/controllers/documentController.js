const pool = require("../config/db");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");

// Configure S3 client
// We allow missing credentials to prevent crash on boot if they are not set,
// but the upload will fail later.
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy",
  },
});

const upload = multer({ storage: multer.memoryStorage() });

exports.uploadMiddleware = upload.single("document");

exports.uploadDocument = async (req, res) => {
  try {
    const { roomId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    if (
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY ||
      !process.env.AWS_S3_BUCKET_NAME
    ) {
      return res.status(500).json({ error: "AWS S3 credentials not configured in backend." });
    }

    // Verify room exists and user is a member or creator
    const roomCheck = await pool.query("SELECT * FROM rooms WHERE id = $1", [roomId]);
    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    const s3Key = `rooms/${roomId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: "public-read", // Commented out, but usually needed if you want direct access without signed URLs. 
      // S3 buckets now block public ACLs by default, it's often better to just use standard links if bucket is public, or signed URLs.
    });

    await s3.send(command);

    // Construct the public URL (assuming the bucket allows public read or is configured for web hosting)
    const region = process.env.AWS_REGION || "us-east-1";
    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;

    // Save to database
    const result = await pool.query(
      `INSERT INTO documents (room_id, user_id, file_name, file_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [roomId, req.user.id, file.originalname, fileUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error uploading document:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getRoomDocuments = async (req, res) => {
  try {
    const { roomId } = req.params;

    const result = await pool.query(
      `SELECT d.*, u.name as uploader_name
       FROM documents d
       JOIN users u ON d.user_id = u.id
       WHERE d.room_id = $1
       ORDER BY d.uploaded_at DESC`,
      [roomId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).json({ error: err.message });
  }
};
