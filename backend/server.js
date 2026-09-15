const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");
const requestId = require("./middleware/requestId");
const errorHandler = require("./middleware/errorHandler");
const { NotFoundError } = require("./utils/errors");
require("dotenv").config();

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

// Connect Database
connectDB();

// ── Middleware (order matters) ────────────────────────────────────
app.use(requestId);                // FIRST — every request gets a UUID

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Express 5 defines req.query as a getter; make it mutable for express-mongo-sanitize
app.use((req, _res, next) => {
    Object.defineProperty(req, "query", {
        value: { ...req.query },
        writable: true,
        configurable: true,
        enumerable: true,
    });
    next();
});
app.use(mongoSanitize());         // strip $ and . from req.body/query/params
app.set("trust proxy", 1);

// Debug logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// ── Routes ───────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));

// Health check
app.get("/", (req, res) => {
    res.json({ message: "Portfolio API Running 🚀" });
});

// ── 404 catch-all (after all routes, before error handler) ───────
app.use((req, _res, next) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// ── Error handler (LAST) ─────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
