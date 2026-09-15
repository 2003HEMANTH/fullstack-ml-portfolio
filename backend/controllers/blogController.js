const Blog = require("../models/Blog");
const { NotFoundError } = require("../utils/errors");

// GET all blogs
const getBlogs = async (req, res) => {
    const blogs = await Blog.find({ published: true })
        .sort({ createdAt: -1 })
        .populate("author", "name");
    res.json({ success: true, blogs });
};

// GET single blog
const getBlog = async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate("author", "name");
    if (!blog) {
        throw new NotFoundError("Blog not found");
    }
    res.json({ success: true, blog });
};

// CREATE blog (admin only)
const createBlog = async (req, res) => {
    const blog = await Blog.create({
        ...req.body,
        author: req.user.id,
    });
    res.status(201).json({ success: true, blog });
};

// UPDATE blog (admin only)
const updateBlog = async (req, res) => {
    const blog = await Blog.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
    );
    if (!blog) {
        throw new NotFoundError("Blog not found");
    }
    res.json({ success: true, blog });
};

// DELETE blog (admin only)
const deleteBlog = async (req, res) => {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
        throw new NotFoundError("Blog not found");
    }
    res.status(204).end();
};

module.exports = { getBlogs, getBlog, createBlog, updateBlog, deleteBlog };