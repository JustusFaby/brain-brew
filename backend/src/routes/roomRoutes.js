const express = require("express");

const router = express.Router();

const auth =
require("../middleware/authMiddleware");

const roomController =
require("../controllers/roomController");

router.post(
 "/create",
 auth,
 roomController.createRoom
);

router.post(
 "/join/:roomId",
 auth,
 roomController.joinRoom
);

router.get(
 "/all",
 roomController.getRooms
);

module.exports = router;
