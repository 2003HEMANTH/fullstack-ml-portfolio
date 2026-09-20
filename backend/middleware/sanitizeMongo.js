const { parse } = require("node:querystring");

const strip = (value) => {
    if (!value || typeof value !== "object") return value;
    for (const key of Object.keys(value)) {
        if (key.startsWith("$") || key.includes(".")) delete value[key];
        else strip(value[key]);
    }
    return value;
};

const sanitizeMongo = (req, _res, next) => {
    strip(req.body);
    strip(req.params);
    strip(req.query);
    next();
};

// Express 5 reparses req.query on every access. Sanitize each parsed object
// so downstream reads remain clean without assigning to the getter.
const parseQuery = (query) => strip(parse(query));
module.exports = { sanitizeMongo, parseQuery, strip };
