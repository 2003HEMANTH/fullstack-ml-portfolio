const { z } = require("zod");

/** Reusable: validates a 24-char hex MongoDB ObjectId */
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid ObjectId");

const idParams = z.object({ id: objectId });

const createProjectBody = z.object({
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().min(1, "Description is required").max(5000),
    techStack: z.union([
        z.array(z.string().max(50)),
        z.string().transform((val) => (val ? val.split(",").map((s) => s.trim()).filter(Boolean) : []))
    ]).default([]),
    githubUrl: z.string().max(500).nullish().or(z.literal("")),
    liveUrl: z.string().max(500).nullish().or(z.literal("")),
    imageUrl: z.string().max(500).nullish().or(z.literal("")),
    featured: z.boolean().default(false),
});

// Update allows partial — every field optional
const updateProjectBody = createProjectBody.partial();

module.exports = { objectId, idParams, createProjectBody, updateProjectBody };
