const express = require("express");
const router = express.Router();
const { getBlogs, getBlog, createBlog, updateBlog, deleteBlog } = require("../controllers/blogController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { idParams, createBlogBody, updateBlogBody } = require("../schemas/blog");

router.get("/", getBlogs);
router.get("/:id", validate(idParams, "params"), getBlog);
router.post("/", protect, adminOnly, validate(createBlogBody), createBlog);
router.put("/:id", protect, adminOnly, validate(idParams, "params"), validate(updateBlogBody), updateBlog);
router.delete("/:id", protect, adminOnly, validate(idParams, "params"), deleteBlog);

module.exports = router;