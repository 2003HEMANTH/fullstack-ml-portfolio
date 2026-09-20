const { AppError, ValidationError } = require("../utils/errors");

/**
 * Central error handler — registered as the LAST middleware.
 *
 * Maps AppError, Mongoose, body-parser, CORS, and unknown errors to the standard envelope:
 * { error: { code, message, details, requestId } }
 */
// eslint-disable-next-line no-unused-vars -- Express requires 4-arg signature
const errorHandler = (err, req, res, _next) => {
    const isProd = process.env.NODE_ENV === "production";

    // ── AppError (our own hierarchy) ──────────────────────────────
    if (err instanceof AppError) {
        if (err instanceof ValidationError && err.details.some((d) => d.field === "id") && req.params && req.params.id) {
            return res.status(400).json({
                error: {
                    code: "INVALID_ID",
                    message: `Invalid value for id: ${req.params.id}`,
                    details: [],
                    requestId: req.id,
                },
            });
        }

        return res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
                requestId: req.id,
            },
        });
    }

    // ── CORS Forbidden Error ─────────────────────────────────────
    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({
            error: {
                code: "FORBIDDEN",
                message: "Not allowed by CORS",
                details: [],
                requestId: req.id,
            },
        });
    }

    // ── Payload Too Large (413 from body-parser) ────────────────
    if (err.type === "entity.too.large" || err.status === 413 || err.statusCode === 413) {
        return res.status(413).json({
            error: {
                code: "PAYLOAD_TOO_LARGE",
                message: "Payload too large. Maximum allowed size is 100KB.",
                details: [],
                requestId: req.id,
            },
        });
    }

    // ── Malformed JSON Syntax (400 from body-parser) ────────────
    if (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400) && "body" in err) {
        return res.status(400).json({
            error: {
                code: "BAD_REQUEST",
                message: "Malformed JSON in request body.",
                details: [],
                requestId: req.id,
            },
        });
    }

    // ── Mongoose ValidationError ─────────────────────────────────
    if (err.name === "ValidationError" && err.errors) {
        const details = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return res.status(422).json({
            error: {
                code: "VALIDATION_ERROR",
                message: "Mongoose validation failed.",
                details,
                requestId: req.id,
            },
        });
    }

    // ── Mongoose CastError (bad ObjectId, etc.) ──────────────────
    if (err.name === "CastError") {
        return res.status(400).json({
            error: {
                code: "INVALID_ID",
                message: `Invalid value for ${err.path}: ${err.value}`,
                details: [],
                requestId: req.id,
            },
        });
    }

    // ── MongoDB duplicate key ────────────────────────────────────
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || "unknown";
        return res.status(409).json({
            error: {
                code: "DUPLICATE",
                message: `Duplicate value for field: ${field}`,
                details: [],
                requestId: req.id,
            },
        });
    }

    // ── JWT Error handling ──────────────────────────────────────
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return res.status(401).json({
            error: {
                code: "UNAUTHORIZED",
                message: "Invalid or expired token.",
                details: [],
                requestId: req.id,
            },
        });
    }

    // ── Fallback: unexpected / programmer error ──────────────────
    console.error(`[${req.id}] Unhandled error:`, err);

    return res.status(500).json({
        error: {
            code: "INTERNAL_ERROR",
            message: isProd ? "An unexpected error occurred." : (err.message || "An unexpected error occurred."),
            details: [],
            requestId: req.id,
        },
    });
};

module.exports = errorHandler;
