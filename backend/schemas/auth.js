const { z } = require("zod");

/** Reusable: validates a 24-char hex MongoDB ObjectId */
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid ObjectId");

const idParams = z.object({ id: objectId });

const loginBody = z.object({
    email: z.string().email("Invalid email address").max(254),
    password: z.string().min(1, "Password is required").max(128),
});

module.exports = { objectId, idParams, loginBody };
