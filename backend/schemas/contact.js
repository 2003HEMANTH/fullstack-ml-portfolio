const { z } = require("zod");

/** Reusable: validates a 24-char hex MongoDB ObjectId */
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid ObjectId");

const idParams = z.object({ id: objectId });

const sendMessageBody = z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address").max(254),
    message: z.string().min(1, "Message is required").max(5000),
});

module.exports = { objectId, idParams, sendMessageBody };
