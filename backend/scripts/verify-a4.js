const assert = require("node:assert/strict");
const { test } = require("node:test");
const { sanitizeBlogContent } = require("../utils/sanitize");
const { sanitizeExistingBlogs } = require("./sanitizeExistingBlogs");
const Blog = require("../models/Blog");
const Project = require("../models/Project");
const { createBlog, updateBlog } = require("../controllers/blogController");

const unsafe = '<p>Hello<strong> world</strong></p><script>alert(1)</script><img src="https://example.com/a.png" onerror="alert(1)"><a href="javascript:alert(1)">link</a>';

test("sanitizer strips executable HTML and preserves supported formatting", () => {
    const clean = sanitizeBlogContent(unsafe);
    assert.ok(clean.includes('<p>Hello<strong> world</strong></p>'));
    assert.ok(clean.includes('src="https://example.com/a.png"'));
    assert.doesNotMatch(clean, /script|onerror|javascript:/i);
    assert.ok(clean.includes('target="_blank" rel="noopener noreferrer nofollow"'));
    assert.equal(sanitizeBlogContent(clean), clean);
    for (const href of ['jav&#x61;script:alert(1)', 'data:text/html,test', 'vbscript:test']) {
        assert.doesNotMatch(sanitizeBlogContent(`<a href="${href}">x</a>`), /href=/);
    }
    assert.ok(sanitizeBlogContent('<a href="mailto:test@example.com">mail</a>').includes('href="mailto:'));
});

test("create and update sanitize before persistence; metadata edits preserve content", async (t) => {
    let created;
    let updated;
    t.mock.method(Blog, "create", async (data) => { created = data; return data; });
    t.mock.method(Blog, "findByIdAndUpdate", async (_id, data) => { updated = data; return data; });
    const res = { status() { return this; }, json() {} };
    await createBlog({ body: { title: "Post", content: unsafe }, user: { id: "owner" } }, res);
    assert.equal(created.content, sanitizeBlogContent(unsafe));
    assert.equal(created.author, "owner");
    await updateBlog({ body: { content: unsafe }, params: { id: "post" } }, res);
    assert.equal(updated.content, sanitizeBlogContent(unsafe));
    await updateBlog({ body: { title: "Updated" }, params: { id: "post" } }, res);
    assert.equal(Object.hasOwn(updated, "content"), false);
});

function fixture({ conflict = false, fail = false } = {}) {
    const rows = [{ _id: "old", content: unsafe }, { _id: "clean", content: "<p>Safe</p>" }];
    let closed = 0;
    let writes = 0;
    const model = {
        find(filter) {
            assert.deepEqual(filter, {});
            return { select() { return this; }, lean() { return this; }, cursor() {
                return {
                    async *[Symbol.asyncIterator]() { yield* rows; },
                    async close() { closed++; },
                };
            } };
        },
        async updateOne(filter, update, options) {
            writes++;
            if (fail) throw new Error("database failure");
            assert.equal(options.timestamps, false);
            const row = rows.find((item) => item._id === filter._id && item.content === filter.content);
            if (!row || conflict) return { matchedCount: 0 };
            row.content = update.$set.content;
            return { matchedCount: 1 };
        },
    };
    return { model, rows, closed: () => closed, writes: () => writes };
}

test("migration updates legacy content, skips clean posts, and is idempotent", async () => {
    const f = fixture();
    assert.deepEqual(await sanitizeExistingBlogs({ model: f.model }), { scanned: 2, changed: 1, updated: 1, conflicts: 0 });
    assert.equal(f.rows[0].content, sanitizeBlogContent(unsafe));
    assert.deepEqual(await sanitizeExistingBlogs({ model: f.model }), { scanned: 2, changed: 0, updated: 0, conflicts: 0 });
    assert.equal(f.closed(), 2);
});

test("migration dry run does not write; concurrent edits are reported", async () => {
    const f = fixture();
    const dry = await sanitizeExistingBlogs({ model: f.model, dryRun: true });
    assert.equal(dry.changed, 1);
    assert.equal(f.writes(), 0);
    const conflict = fixture({ conflict: true });
    assert.equal((await sanitizeExistingBlogs({ model: conflict.model })).conflicts, 1);
    assert.equal(conflict.rows[0].content, unsafe);
});

test("migration closes cursor and propagates failures", async () => {
    const f = fixture({ fail: true });
    await assert.rejects(sanitizeExistingBlogs({ model: f.model }), /database failure/);
    assert.equal(f.closed(), 1);
});

test("Express 5 query request and Zod v4 failures work through the real app", async (t) => {
    const app = require("../server");
    t.mock.method(Project, "find", () => ({ async sort() { return []; } }));
    const server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    try {
        const base = `http://127.0.0.1:${server.address().port}`;
        const read = await fetch(`${base}/api/projects?foo=bar&%24where=bad`);
        assert.equal(read.status, 200);
        const invalid = await fetch(`${base}/api/auth/login`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "invalid", password: "" }),
        });
        assert.equal(invalid.status, 422);
        const body = await invalid.json();
        assert.equal(body.error.code, "VALIDATION_ERROR");
        assert.ok(body.error.details.length > 0);
    } finally {
        server.closeAllConnections();
        await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    }
});

