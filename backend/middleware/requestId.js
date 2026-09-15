const { randomUUID } = require("node:crypto");

/**
 * Assigns a unique request ID (UUIDv4) to every incoming request.
 * Sets req.id and the X-Request-Id response header.
 */
const requestId = (req, res, next) => {
    const id = randomUUID();
    req.id = id;
    res.setHeader("X-Request-Id", id);
    next();
};

module.exports = requestId;
