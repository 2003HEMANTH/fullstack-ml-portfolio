const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, markAsRead, deleteMessage } = require("../controllers/contactController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { contactLimiter } = require("../middleware/rateLimiter");
const { idParams, sendMessageBody } = require("../schemas/contact");

router.post("/", contactLimiter, validate(sendMessageBody), sendMessage);
router.get("/", protect, adminOnly, getMessages);
router.patch("/:id", protect, adminOnly, validate(idParams, "params"), markAsRead);
router.delete("/:id", protect, adminOnly, validate(idParams, "params"), deleteMessage);

module.exports = router;