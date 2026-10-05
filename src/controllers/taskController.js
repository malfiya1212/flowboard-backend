const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create a task inside an owned project
// @route   POST /api/projects/:id/tasks
// @access  Private
const createTask = async(req, res) => {
    try {
        const { id: projectId } = req.params;
        const { title, description, status, priority, dueDate } = req.body;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Task title is required.' });
        }

        // Security check: Verify project belongs to current user
        const project = await Project.findOne({ _id: projectId, user: req.user._id });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or unauthorized.' });
        }

        const newTask = await Task.create({
            title: title.trim(),
            description: description ? description.trim() : '',
            status: status || 'Todo',
            priority: priority || 'Medium',
            dueDate: dueDate ? new Date(dueDate) : null,
            project: project._id,
            user: req.user._id,
        });

        return res.status(201).json(newTask);
    } catch (error) {
        return res.status(400).json({
            message: error.message || 'Failed to create task.',
        });
    }
};

// @desc    Update task fields (status, priority, title, description, dueDate)
// @route   PATCH /api/tasks/:id
// @access  Private
const updateTask = async(req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, dueDate } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Security check: Find task scoped to requesting user
        const task = await Task.findOne({ _id: id, user: req.user._id });
        if (!task) {
            return res.status(404).json({ message: 'Task not found or access denied.' });
        }

        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({ message: 'Task title cannot be empty.' });
            }
            task.title = title.trim();
        }

        if (description !== undefined) {
            task.description = description.trim();
        }

        if (status !== undefined) {
            task.status = status;
        }

        if (priority !== undefined) {
            task.priority = priority;
        }

        if (dueDate !== undefined) {
            task.dueDate = dueDate ? new Date(dueDate) : null;
        }

        await task.save();
        return res.status(200).json(task);
    } catch (error) {
        return res.status(400).json({
            message: error.message || 'Failed to update task.',
        });
    }
};

// @desc    Delete a specific task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async(req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        const task = await Task.findOneAndDelete({ _id: id, user: req.user._id });
        if (!task) {
            return res.status(404).json({ message: 'Task not found or access denied.' });
        }

        return res.status(200).json({ message: 'Task removed successfully.' });
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to delete task.',
        });
    }
};

module.exports = {
    createTask,
    updateTask,
    deleteTask,
};