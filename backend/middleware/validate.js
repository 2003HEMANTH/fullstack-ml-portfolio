const { ValidationError } = require("../utils/errors");

/**
 * Express middleware factory — validates req[source] against a Zod schema.
 *
 * On success the parsed (and coerced/stripped) value replaces req[source].
 * On failure:
 * - If validating params and an "id" field failed, creates a CastError for 400 INVALID_ID
 * - Otherwise forwards a ValidationError to the error handler.
 *
 * @param {import("zod").ZodSchema} schema
 * @param {"body"|"params"|"query"} [source="body"]
 */
const validate = (schema, source = "body") => (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
        if (source === "params" && result.error.issues.some((i) => i.path.includes("id"))) {
            const err = new Error(`Invalid value for id: ${req[source]?.id}`);
            err.name = "CastError";
            err.path = "id";
            err.value = req[source]?.id;
            return next(err);
        }
        return next(new ValidationError(result.error));
    }
    req[source] = result.data;
    next();
};

module.exports = validate;
