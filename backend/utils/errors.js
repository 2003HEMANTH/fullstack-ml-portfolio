/**
 * AppError base class and semantic subclasses.
 *
 * Every subclass carries a numeric statusCode and an UPPER_SNAKE code
 * so the error handler can build the standard envelope automatically.
 */

class AppError extends Error {
    /** @param {number} statusCode @param {string} code @param {string} message @param {Array} [details] */
    constructor(statusCode, code, message, details = []) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;     // distinguishes expected errors from bugs
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    /** @param {import("zod").ZodError} zodError */
    constructor(zodError) {
        const details = zodError.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
        }));
        super(422, "VALIDATION_ERROR", "Request validation failed.", details);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = "Authentication required.") {
        super(401, "UNAUTHORIZED", message);
    }
}

class ForbiddenError extends AppError {
    constructor(message = "Insufficient permissions.") {
        super(403, "FORBIDDEN", message);
    }
}

class NotFoundError extends AppError {
    constructor(message = "Resource not found.") {
        super(404, "NOT_FOUND", message);
    }
}

class ConflictError extends AppError {
    constructor(message = "Resource already exists.") {
        super(409, "CONFLICT", message);
    }
}

module.exports = {
    AppError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
};
