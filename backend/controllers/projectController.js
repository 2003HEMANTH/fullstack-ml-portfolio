const Project = require("../models/Project");
const { NotFoundError } = require("../utils/errors");

// GET all projects
const getProjects = async (req, res) => {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ success: true, projects });
};

// GET single project
const getProject = async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) {
        throw new NotFoundError("Project not found");
    }
    res.json({ success: true, project });
};

// CREATE project (admin only)
const createProject = async (req, res) => {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, project });
};

// UPDATE project (admin only)
const updateProject = async (req, res) => {
    const project = await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
    );
    if (!project) {
        throw new NotFoundError("Project not found");
    }
    res.json({ success: true, project });
};

// DELETE project (admin only)
const deleteProject = async (req, res) => {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
        throw new NotFoundError("Project not found");
    }
    res.status(204).end();
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject };