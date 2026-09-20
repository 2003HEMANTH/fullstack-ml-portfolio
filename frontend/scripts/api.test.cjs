const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const axios = require("axios");
process.env.NEXT_PUBLIC_API_URL = "https://api.example/api";
process.env.NEXT_PUBLIC_ML_URL = " https://ml.example/\n";
// Compile the actual TypeScript module using the existing compiler, not a copy.
const filename = path.resolve(__dirname, "../src/lib/api.ts");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText;
const loaded = new Module(filename, module);
loaded.filename = filename;
loaded.paths = module.paths;
loaded._compile(compiled, filename);
const { default: api, mlApi, ApiError, normalizeApiError, errorMessage, mlErrorMessage } = loaded.exports;
function failure(status, code, details = []) {
  return new axios.AxiosError("Request failed", "ERR_BAD_RESPONSE", undefined, undefined,
    { status, data: { error: { code, message: "Validation failed", details, requestId: "test-id" } } });
}
test("normalizes envelopes and preserves field details and status", async () => {
  const error = failure(422, "VALIDATION_ERROR", [{ field: "email", message: "Invalid email" }]);
  const normalized = normalizeApiError(error);
  assert.equal(normalized.status, 422);
  assert.equal(normalized.code, "VALIDATION_ERROR");
  assert.equal(normalized.requestId, "test-id");
  assert.match(errorMessage(normalized), /email: Invalid email/);
  api.defaults.adapter = () => Promise.reject(error);
  await assert.rejects(api.get("/auth/me"), (result) => result instanceof ApiError && result.status === 422);
});
test("429 and network failures have readable messages", () => {
  assert.equal(errorMessage(failure(429, "RATE_LIMITED")), "Too many attempts. Try again in a few minutes.");
  assert.equal(mlErrorMessage(new axios.AxiosError("Network Error")), "The analyzer is unreachable. Try again shortly.");
  assert.doesNotMatch(errorMessage(failure(502, "HTTP_ERROR")), /undefined/);
});
test("each ML failure has actionable wording and a 90 second timeout", () => {
  for (const [status, code, expected] of [
    [413, "PAYLOAD_TOO_LARGE", "File too large. Maximum 5MB."],
    [400, "FILE_NOT_PDF", "That file isn't a PDF."],
    [422, "PARSE_TIMEOUT", "That PDF took too long to read. Try a simpler layout."],
    [422, "PDF_ENCRYPTED", "This PDF is password-protected. Remove the password."],
    [503, "AI_NOT_CONFIGURED", "AI analysis is not configured on the server."],
    [502, "AI_INVALID_RESPONSE", "The AI returned an invalid response. Try again."],
    [503, "AI_UNAVAILABLE", "AI analysis is temporarily unavailable. Try again shortly."],
    [422, "JOB_DESCRIPTION_TOO_LONG", "Job description must be 20,000 characters or fewer."],
  ]) assert.equal(mlErrorMessage(failure(status, code)), expected);
  for (const code of ["RESUME_NOT_TEXT", "PDF_NO_TEXT"]) assert.match(mlErrorMessage(failure(422, code)), /scanned image/);
  assert.equal(mlApi.defaults.timeout, 90_000);
  assert.equal(mlApi.defaults.baseURL, "https://ml.example");
});
test("ML uploads keep multipart boundary generation available", async () => {
  mlApi.defaults.adapter = async (config) => {
    assert.ok(config.data instanceof FormData);
    assert.notEqual(config.headers.getContentType(), "application/json");
    return { data: { success: true }, status: 200, statusText: "OK", headers: {}, config };
  };
  const form = new FormData(); form.append("resume", new Blob(["%PDF-"]), "resume.pdf");
  await mlApi.post("/analyze", form);
});
