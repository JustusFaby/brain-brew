const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const documentController = require("../controllers/documentController");

router.post(
  "/:roomId/documents",
  auth,
  documentController.uploadMiddleware,
  documentController.uploadDocument
);

router.get(
  "/:roomId/documents",
  auth,
  documentController.getRoomDocuments
);

module.exports = router;
