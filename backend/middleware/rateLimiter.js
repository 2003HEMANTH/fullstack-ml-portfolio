const rateLimit = require("express-rate-limit");

/**
 * Creates a rate limiter instance with the standard error envelope.
 *
 * @param {object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Max requests allowed in the window
 * @param {string} options.message - Error message when rate limit exceeded
 */
const createLimiter = ({ windowMs, max, message }) =>
    rateLimit({
        windowMs,
        limit: max,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, _next, options) => {
            res.status(options.statusCode || 429).json({
                error: {
                    code: "RATE_LIMITED",
                    message: message || "Too many requests, please try again later.",
                    details: [],
                    requestId: req.id,
                },
            });
        },
    });

// POST /api/auth/login: 5 per 15 min per IP
const loginLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts. Please try again after 15 minutes.",
});

// POST /api/contact: 3 per hour per IP
const contactLimiter = createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: "Too many contact messages sent. Please try again after an hour.",
});

// all /api: 100 per 15 min per IP
const apiLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests. Please try again later.",
});

module.exports = {
    apiLimiter,
    loginLimiter,
    contactLimiter,
};
