const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, markAsRead, deleteMessage } = require("../controllers/contactController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", sendMessage);
router.get("/", protect, adminOnly, getMessages);
router.patch("/:id", protect, adminOnly, markAsRead);
router.delete("/:id", protect, adminOnly, deleteMessage);

module.exports = router;