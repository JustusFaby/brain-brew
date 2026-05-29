const express = require("express");

const router = express.Router();

const auth =
require("../middleware/authMiddleware");

const sessionController =
require("../controllers/sessionController");

router.post(
  "/start",
  auth,
  sessionController.startSession
);

router.post(
  "/end/:sessionId",
  auth,
  sessionController.endSession
);

router.get(
  "/analytics",
  auth,
  sessionController.getAnalytics
);

router.get(
  "/leaderboard",
  sessionController.getLeaderboard
);

router.get(
  "/dashboard",
  auth,
  sessionController.getDashboard
);

module.exports = router;
