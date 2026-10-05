const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
} = require('../controllers/projectController');

// All project routes require authentication
router.use(protect);

router.route('/')
    .get(getProjects)
    .post(createProject);

router.route('/:id')
    .get(getProjectById)
    .patch(updateProject)
    .delete(deleteProject);

module.exports = router;