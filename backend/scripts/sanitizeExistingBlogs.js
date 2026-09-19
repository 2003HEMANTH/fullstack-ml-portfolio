const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const { sanitizeBlogContent } = require("../utils/sanitize");

// Maintenance operation intentionally covers every author's published and draft posts.
// Stream records and compare the original content when writing to avoid overwriting edits.
async function sanitizeExistingBlogs({ model = Blog, dryRun = false } = {}) {
    const counts = { scanned: 0, changed: 0, updated: 0, conflicts: 0 };
    const cursor = model.find({}).select("_id content").lean().cursor();
    try {
        for await (const blog of cursor) {
            counts.scanned++;
            const content = sanitizeBlogContent(blog.content);
            if (content === blog.content) continue;
            counts.changed++;
            if (dryRun) continue;
            const result = await model.updateOne(
                { _id: blog._id, content: blog.content },
                { $set: { content } },
                { timestamps: false },
            );
            if (result.matchedCount === 1) counts.updated++;
            else counts.conflicts++;
        }
    } finally {
        await cursor.close();
    }
    return counts;
}

async function main() {
    require("dotenv").config();
    const args = process.argv.slice(2);
    if (args.some((arg) => arg !== "--dry-run")) {
        throw new Error("Usage: npm run sanitize:blogs -- [--dry-run]");
    }
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required.");
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const counts = await sanitizeExistingBlogs({ dryRun: args.includes("--dry-run") });
        console.log(JSON.stringify(counts));
        if (counts.conflicts > 0) {
            console.error("Concurrent edits were skipped. Run the migration again.");
            process.exitCode = 1;
        }
    } finally {
        await mongoose.disconnect();
    }
}

if (require.main === module) {
    main().catch(() => {
        // Avoid exposing connection credentials or stored content in error output.
        console.error("Blog sanitization failed. Check MONGO_URI, connectivity, and arguments; rerun after resolving the failure.");
        process.exitCode = 1;
    });
}

module.exports = { sanitizeExistingBlogs };
