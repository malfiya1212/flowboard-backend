const Project = require('../models/Project');
const Task = require('../models/Task');

// GET /api/projects
const getProjects = async(req, res) => {
    try {
        // Only return projects owned by the authenticated user
        const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/projects
const createProject = async(req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Project name is required.' });
        }

        const project = await Project.create({
            name: name.trim(),
            description: description ? description.trim() : '',
            user: req.user._id,
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/projects/:id
const getProjectById = async(req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Attach project tasks
        const tasks = await Task.find({ project: project._id, user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({...project.toObject(), tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/projects/:id
const updateProject = async(req, res) => {
    try {
        const { name, description } = req.body;
        const project = await Project.findOne({ _id: req.params.id, user: req.user._id });

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        if (name !== undefined) project.name = name.trim();
        if (description !== undefined) project.description = description.trim();

        await project.save();
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/projects/:id
const deleteProject = async(req, res) => {
    try {
        const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Cascade delete associated tasks
        await Task.deleteMany({ project: project._id, user: req.user._id });

        res.status(200).json({ message: 'Project and all related tasks deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
};