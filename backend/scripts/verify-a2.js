const express = require("express");
const http = require("http");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const requestId = require("../middleware/requestId");
const errorHandler = require("../middleware/errorHandler");
const { NotFoundError } = require("../utils/errors");

// Build a test Express app with the exact middleware and route config
const app = express();

app.use(requestId);
app.use(express.json());
app.use(cookieParser());

// Express 5 compatibility for express-mongo-sanitize
app.use((req, _res, next) => {
    Object.defineProperty(req, "query", {
        value: { ...req.query },
        writable: true,
        configurable: true,
        enumerable: true,
    });
    next();
});
app.use(mongoSanitize());

// Mount actual routers
app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/projects", require("../routes/projectRoutes"));
app.use("/api/blogs", require("../routes/blogRoutes"));
app.use("/api/contact", require("../routes/contactRoutes"));

// Add a dummy route to test unhandled throw in controller
app.get("/api/test-throw", async () => {
    throw new Error("Simulated unhandled controller explosion");
});

// 404 catch-all
app.use((req, _res, next) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// Central error handler
app.use(errorHandler);

// Helper for making HTTP requests
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
            req.setHeader("Content-Type", "application/json");
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
        // 1. 404 Catch-All & Error Envelope + Request ID
        {
            const res = await request(server, "/api/non-existent-route");
            assert("404 catch-all returns 404", res.status === 404, `(got ${res.status})`);
            assert("404 response has code NOT_FOUND", res.body?.error?.code === "NOT_FOUND");
            assert("404 response has requestId", typeof res.body?.error?.requestId === "string");
            assert(
                "404 requestId matches X-Request-Id header",
                res.body?.error?.requestId === res.headers["x-request-id"]
            );
        }

        // 2. Malformed Body -> 422 with per-field details
        {
            const res = await request(server, "/api/contact", {
                method: "POST",
                body: { name: "", email: "not-an-email" }, // missing message, invalid email, empty name
            });
            assert("Malformed body returns 422", res.status === 422, `(got ${res.status})`);
            assert("Error code is VALIDATION_ERROR", res.body?.error?.code === "VALIDATION_ERROR");
            assert("Details array is non-empty", Array.isArray(res.body?.error?.details) && res.body.error.details.length > 0);
            const paths = res.body?.error?.details?.map((d) => d.path) || [];
            assert("Details contain name error", paths.includes("name"));
            assert("Details contain email error", paths.includes("email"));
            assert("Details contain message error", paths.includes("message"));
            assert("RequestId matches X-Request-Id", res.body?.error?.requestId === res.headers["x-request-id"]);
        }

        // 3. Auth login validation -> 422 on invalid body
        {
            const res = await request(server, "/api/auth/login", {
                method: "POST",
                body: { email: 12345 }, // invalid email, missing password
            });
            assert("Login with malformed body returns 422", res.status === 422, `(got ${res.status})`);
            assert("Login validation error code is VALIDATION_ERROR", res.body?.error?.code === "VALIDATION_ERROR");
            assert("RequestId matches header", res.body?.error?.requestId === res.headers["x-request-id"]);
        }

        // 4. Invalid ObjectId in URL -> 400 INVALID_ID, not 500
        {
            const res = await request(server, "/api/projects/not-a-valid-object-id");
            assert("Invalid ObjectId in URL returns 400", res.status === 400, `(got ${res.status})`);
            assert("Error code is INVALID_ID", res.body?.error?.code === "INVALID_ID");
            assert("RequestId matches header", res.body?.error?.requestId === res.headers["x-request-id"]);
        }

        {
            const res = await request(server, "/api/blogs/12345");
            assert("Invalid ObjectId in blog URL returns 400", res.status === 400, `(got ${res.status})`);
            assert("Blog error code is INVALID_ID", res.body?.error?.code === "INVALID_ID");
            assert("RequestId matches header", res.body?.error?.requestId === res.headers["x-request-id"]);
        }

        // 5. Unhandled throw in controller -> 500 with no stack in body
        {
            const res = await request(server, "/api/test-throw");
            assert("Unhandled throw returns 500", res.status === 500, `(got ${res.status})`);
            assert("Error code is INTERNAL_ERROR", res.body?.error?.code === "INTERNAL_ERROR");
            assert("No stack property in error body", res.body?.error?.stack === undefined);
            assert("RequestId matches header", res.body?.error?.requestId === res.headers["x-request-id"]);
        }

        console.log(`\nResults: ${passed} passed, ${failed} failed`);
    } finally {
        server.close();
    }

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((e) => {
    console.error("Test runner crashed:", e);
    process.exit(1);
});
