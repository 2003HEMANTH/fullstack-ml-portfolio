const Project = require("../models/Project");

// GET all projects
const getProjects = async(req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET single project
const getProject = async(req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json({ success: true, project });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CREATE project (admin only)
const createProject = async(req, res) => {
    try {
        const { title, description, techStack, githubUrl, liveUrl, imageUrl, featured } = req.body;
        const project = await Project.create({
            title,
            description,
            techStack,
            githubUrl,
            liveUrl,
            imageUrl,
            featured
        });
        res.status(201).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE project (admin only)
const updateProject = async(req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body, { new: true }
        );
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json({ success: true, project });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE project (admin only)
const deleteProject = async(req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json({ success: true, message: "Project deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject };