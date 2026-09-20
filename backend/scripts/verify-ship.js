const assert = require("node:assert/strict");
const { test } = require("node:test");
const express = require("express");
const { sanitizeMongo, parseQuery } = require("../middleware/sanitizeMongo");
const Project = require("../models/Project");
const app = require("../server");
async function serve(application, fn) {
    const server = application.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    try { await fn(`http://127.0.0.1:${server.address().port}`); }
    finally { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
}
test("sanitized Express 5 query remains clean across repeated getter access", async () => {
    const sample = express();
    sample.set("query parser", parseQuery);
    sample.use(express.json(), sanitizeMongo);
    sample.post("/", (req, res) => res.json({ first: req.query, second: req.query, body: req.body }));
    await serve(sample, async (base) => {
        const response = await fetch(`${base}/?foo=bar&%24where=x&profile.name=x`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ safe: [{ $where: "bad", "a.b": "bad", good: "ok" }] }),
        });
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { first: { foo: "bar" }, second: { foo: "bar" }, body: { safe: [{ good: "ok" }] } });
    });
});
test("real routes accept query strings, validate fields, rate limit and expose health", async (t) => {
    // Database adapter is stubbed; actual HTTP app, middleware and routes run.
    t.mock.method(Project, "find", () => ({ async sort() { return []; } }));
    await serve(app, async (base) => {
        assert.equal((await fetch(`${base}/api/projects?foo=bar`)).status, 200);
        const invalid = await fetch(`${base}/api/projects/notanid`);
        assert.equal(invalid.status, 400);
        assert.equal((await invalid.json()).error.code, "INVALID_ID");
        for (let attempt = 0; attempt < 6; attempt++) {
            const login = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: '{}' });
            assert.equal(login.status, attempt === 5 ? 429 : 422);
            const body = await login.json();
            if (attempt < 5) assert.ok(body.error.details.some((detail) => detail.field === "email"));
        }
        const health = await fetch(`${base}/healthz`);
        assert.equal(health.status, 200);
        assert.equal(await health.text(), "ok");
        assert.equal(health.headers.get("ratelimit-limit"), null);
    });
});
test("production cookies support secure cross-site authentication", () => {
    const previous = process.env.NODE_ENV;
    const filename = require.resolve("../config/cookieOptions");
    try {
        process.env.NODE_ENV = "production"; delete require.cache[filename];
        const options = require(filename);
        assert.equal(options.secure, true);
        assert.equal(options.sameSite, "none");
        assert.equal(options.httpOnly, true);
        assert.equal(app.get("trust proxy"), 1);
    } finally {
        if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous;
        delete require.cache[filename];
    }
});
