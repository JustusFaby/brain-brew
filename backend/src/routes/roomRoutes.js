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

router.get(
 "/:roomId",
 auth,
 roomController.getRoomById
);

router.get(
 "/:roomId/members",
 auth,
 roomController.getRoomMembers
);

router.post(
 "/leave/:roomId",
 auth,
 roomController.leaveRoom
);

router.delete(
 "/:roomId",
 auth,
 roomController.deleteRoom
);

module.exports = router;
