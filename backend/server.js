const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const requestId = require("./middleware/requestId");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");
const { NotFoundError, ForbiddenError } = require("./utils/errors");
require("dotenv").config();

const app = express();

// Required on Render / reverse proxies for accurate client IP in rate limiting & TLS termination
app.set("trust proxy", 1);

// ── Middleware (order matters) ────────────────────────────────────
// 1. Request ID (FIRST — every request gets a UUID and X-Request-Id header)
app.use(requestId);

// 2. Helmet security headers with cross-origin resource policy for frontend
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// 3. CORS with explicit allowlist from CLIENT_URL
const getAllowedOrigins = () =>
    (process.env.CLIENT_URL || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
            if (!origin) {
                return callback(null, true);
            }
            const allowed = getAllowedOrigins();
            if (allowed.includes(origin)) {
                return callback(null, true);
            }
            return callback(new ForbiddenError("Not allowed by CORS"));
        },
        credentials: true,
    })
);

// 4. JSON Body parser capped at 100kb (mitigate body parser DoS)
app.use(express.json({ limit: "100kb" }));

// 5. Cookie Parser
app.use(cookieParser());

// 6. Express 5 compatibility for express-mongo-sanitize (req.query is a getter)
app.use((req, _res, next) => {
    Object.defineProperty(req, "query", {
        value: { ...req.query },
        writable: true,
        configurable: true,
        enumerable: true,
    });
    next();
});

// 7. Mongo Sanitize (strip $ and . from req.body/params/query)
app.use(mongoSanitize());

// Debug logger
app.use((req, _res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// 8. General rate limiter for all /api endpoints (100 per 15 min per IP)
app.use("/api", apiLimiter);

// ── Routes ───────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));

// Health check
app.get("/", (_req, res) => {
    res.json({ message: "Portfolio API Running 🚀" });
});

// ── 404 catch-all (after all routes, before error handler) ───────
app.use((req, _res, next) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// ── Error handler (LAST) ─────────────────────────────────────────
app.use(errorHandler);

// ── Server startup & Graceful Shutdown ────────────────────────────
const PORT = process.env.PORT || 5000;

if (require.main === module) {
    connectDB();
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    const gracefulShutdown = (signal) => {
        console.log(`Received ${signal}. Starting graceful shutdown...`);
        server.close(async () => {
            console.log("HTTP server closed. Closing MongoDB connection...");
            try {
                await mongoose.connection.close(false);
                console.log("MongoDB connection closed. Exiting process.");
                process.exit(0);
            } catch (err) {
                console.error("Error during MongoDB disconnection:", err);
                process.exit(1);
            }
        });

        // Force close after 10s if hanging
        setTimeout(() => {
            console.error("Graceful shutdown timed out. Forcing exit.");
            process.exit(1);
        }, 10000).unref();
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

module.exports = app;
