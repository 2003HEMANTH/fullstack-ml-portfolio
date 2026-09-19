const sanitizeHtml = require("sanitize-html");

const allowedTags = [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "blockquote",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "a",
    "img",
    "code",
    "pre",
    "hr",
];

const allowedAttributes = {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
};

const allowedSchemes = ["http", "https", "mailto"];

const sanitizeOptions = {
    allowedTags,
    allowedAttributes,
    allowedSchemes,
    transformTags: {
        a: sanitizeHtml.simpleTransform("a", {
            target: "_blank",
            rel: "noopener noreferrer nofollow",
        }),
    },
};

/**
 * Sanitizes blog HTML content against an explicit allowlist to prevent stored XSS.
 *
 * @param {string} html - Raw HTML string from user input / editor
 * @returns {string} Sanitized safe HTML string
 */
const sanitizeBlogContent = (html) => {
    if (!html || typeof html !== "string") {
        return "";
    }
    return sanitizeHtml(html, sanitizeOptions);
};

module.exports = {
    sanitizeBlogContent,
    sanitizeOptions,
};
