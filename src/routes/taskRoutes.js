const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { updateTask, deleteTask } = require('../controllers/taskController');

router.use(protect);

router.route('/:id')
    .patch(updateTask)
    .delete(deleteTask);

module.exports = router;