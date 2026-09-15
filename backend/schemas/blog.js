const { z } = require("zod");

/** Reusable: validates a 24-char hex MongoDB ObjectId */
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid ObjectId");

const idParams = z.object({ id: objectId });

const createBlogBody = z.object({
    title: z.string().min(1, "Title is required").max(200),
    content: z.string().min(1, "Content is required").max(50000),
    summary: z.string().max(500).nullish().or(z.literal("")),
    coverImage: z.string().max(500).nullish().or(z.literal("")),
    tags: z.union([
        z.array(z.string().max(50)),
        z.string().transform((val) => (val ? val.split(",").map((s) => s.trim()).filter(Boolean) : []))
    ]).default([]),
    published: z.boolean().default(false),
});

const updateBlogBody = createBlogBody.partial();

module.exports = { objectId, idParams, createBlogBody, updateBlogBody };
