const express = require("express");
const router = express.Router();
const { login, logout, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { loginLimiter } = require("../middleware/rateLimiter");
const { loginBody } = require("../schemas/auth");

router.post("/login", loginLimiter, validate(loginBody), login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;