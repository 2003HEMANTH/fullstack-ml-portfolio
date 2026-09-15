const http = require("http");

// Ensure CLIENT_URL is set before importing app
process.env.CLIENT_URL = "http://localhost:3000,https://myportfolio.vercel.app";

const app = require("../server");

// Helper for HTTP requests
function request(server, path, options = {}) {
    return new Promise((resolve, reject) => {
        const addr = server.address();
        const reqOptions = {
            hostname: "127.0.0.1",
            port: addr.port,
            path,
            method: options.method || "GET",
            headers: options.headers || {},
        };

        const req = http.request(reqOptions, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                let body = null;
                try {
                    body = JSON.parse(data);
                } catch {
                    body = data;
                }
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body,
                });
            });
        });

        req.on("error", reject);

        if (options.body) {
            req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
}

async function runTests() {
    const server = app.listen(0);
    let passed = 0;
    let failed = 0;

    function assert(name, condition, extra = "") {
        if (condition) {
            console.log(`PASS: ${name}`);
            passed++;
        } else {
            console.error(`FAIL: ${name} ${extra}`);
            failed++;
        }
    }

    try {
        // ── 1. Helmet defaults & cross-origin policy ─────────────────
        {
            const res = await request(server, "/");
            assert("Helmet sets X-Content-Type-Options: nosniff", res.headers["x-content-type-options"] === "nosniff");
            assert("Helmet sets X-Frame-Options: SAMEORIGIN", res.headers["x-frame-options"] === "SAMEORIGIN");
            assert(
                "Helmet sets Cross-Origin-Resource-Policy: cross-origin",
                res.headers["cross-origin-resource-policy"] === "cross-origin"
            );
            assert("Helmet sets X-DNS-Prefetch-Control", res.headers["x-dns-prefetch-control"] === "off");
        }

        // ── 2. CORS allowlist vs unknown origin ──────────────────────
        {
            // Unknown origin -> rejected with 403
            const rejectedRes = await request(server, "/", {
                headers: { Origin: "http://attacker-site.com" },
            });
            assert("Unknown origin is rejected with 403", rejectedRes.status === 403, `(got ${rejectedRes.status})`);
            assert("CORS rejection returns FORBIDDEN code", rejectedRes.body?.error?.code === "FORBIDDEN");
            assert("CORS rejection includes requestId", typeof rejectedRes.body?.error?.requestId === "string");

            // Allowed origin -> accepted with Access-Control-Allow-Origin
            const allowedRes = await request(server, "/", {
                headers: { Origin: "http://localhost:3000" },
            });
            assert(
                "Allowed origin has Access-Control-Allow-Origin header",
                allowedRes.headers["access-control-allow-origin"] === "http://localhost:3000"
            );
            assert(
                "Allowed origin has Access-Control-Allow-Credentials",
                allowedRes.headers["access-control-allow-credentials"] === "true"
            );
        }

        // ── 3. 200KB JSON body -> 413 Payload Too Large ─────────────
        {
            // Create a payload > 100KB (e.g. ~200KB)
            const largeData = "x".repeat(200 * 1024);
            const res = await request(server, "/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: largeData }),
            });
            assert("200KB body returns 413", res.status === 413, `(got ${res.status})`);
            assert("413 code is PAYLOAD_TOO_LARGE", res.body?.error?.code === "PAYLOAD_TOO_LARGE");
            assert("413 response contains requestId", typeof res.body?.error?.requestId === "string");
            assert("413 requestId matches X-Request-Id header", res.body?.error?.requestId === res.headers["x-request-id"]);
        }

        // ── 4. Rate Limiting: 6 rapid login attempts ─────────────────
        {
            let sixthRes = null;
            for (let i = 1; i <= 6; i++) {
                // Sending invalid body triggers Zod (422) for attempts 1-5 without hitting DB
                const res = await request(server, "/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                });
                if (i <= 5) {
                    assert(`Attempt ${i} is not rate-limited (status ${res.status})`, res.status === 422);
                } else {
                    sixthRes = res;
                }
            }

            assert("6th login attempt returns 429", sixthRes?.status === 429, `(got ${sixthRes?.status})`);
            assert("429 error code is RATE_LIMITED", sixthRes?.body?.error?.code === "RATE_LIMITED");
            assert("429 response contains requestId", typeof sixthRes?.body?.error?.requestId === "string");
            assert(
                "429 requestId matches X-Request-Id header",
                sixthRes?.body?.error?.requestId === sixthRes?.headers["x-request-id"]
            );
            assert(
                "Rate limit uses standard headers (ratelimit-remaining)",
                sixthRes?.headers["ratelimit-remaining"] !== undefined || sixthRes?.headers["ratelimit-limit"] !== undefined
            );
        }

        console.log(`\nTask A3 Results: ${passed} passed, ${failed} failed`);
    } finally {
        server.close();
    }

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((e) => {
    console.error("Test runner crashed:", e);
    process.exit(1);
});
