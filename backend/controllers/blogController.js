const Blog = require("../models/Blog");

// GET all blogs
const getBlogs = async(req, res) => {
    try {
        const blogs = await Blog.find({ published: true })
            .sort({ createdAt: -1 })
            .populate("author", "name");
        res.json({ success: true, blogs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET single blog
const getBlog = async(req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate("author", "name");
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.json({ success: true, blog });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CREATE blog (admin only)
const createBlog = async(req, res) => {
    try {
        const { title, content, summary, coverImage, tags, published } = req.body;
        const blog = await Blog.create({
            title,
            content,
            summary,
            coverImage,
            tags,
            published,
            author: req.user.id
        });
        res.status(201).json({ success: true, blog });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE blog (admin only)
const updateBlog = async(req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            req.body, { new: true }
        );
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.json({ success: true, blog });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE blog (admin only)
const deleteBlog = async(req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.json({ success: true, message: "Blog deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getBlogs, getBlog, createBlog, updateBlog, deleteBlog };