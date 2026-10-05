const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/task');

// @desc    Get all projects owned by the logged-in user
// @route   GET /api/projects
// @access  Private
const getProjects = async(req, res) => {
    try {
        const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json(projects);
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to retrieve projects.',
        });
    }
};

// @desc    Create a new project tied to the logged-in user
// @route   POST /api/projects
// @access  Private
const createProject = async(req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: 'Project name is required.',
            });
        }

        const project = await Project.create({
            name: name.trim(),
            description: description ? description.trim() : '',
            user: req.user._id,
        });

        return res.status(201).json(project);
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to create project.',
        });
    }
};

// @desc    Get a single project with its associated tasks
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async(req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Scoped strictly to the logged-in user
        const project = await Project.findOne({ _id: id, user: req.user._id });
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Fetch tasks linked to this project and owned by this user
        const tasks = await Task.find({ project: project._id, user: req.user._id }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            ...project.toObject(),
            tasks,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to retrieve project details.',
        });
    }
};

// @desc    Update project name or description
// @route   PATCH /api/projects/:id
// @access  Private
const updateProject = async(req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        if (name !== undefined && !name.trim()) {
            return res.status(400).json({ message: 'Project name cannot be empty.' });
        }

        const project = await Project.findOne({ _id: id, user: req.user._id });
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        if (name !== undefined) project.name = name.trim();
        if (description !== undefined) project.description = description.trim();

        await project.save();

        return res.status(200).json(project);
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to update project.',
        });
    }
};

// @desc    Delete project and cascade delete all its tasks
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async(req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        const project = await Project.findOneAndDelete({ _id: id, user: req.user._id });
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Cascade delete: remove all tasks associated with this project and user
        await Task.deleteMany({ project: id, user: req.user._id });

        return res.status(200).json({
            message: 'Project and all associated tasks deleted successfully.',
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to delete project.',
        });
    }
};

module.exports = {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
};