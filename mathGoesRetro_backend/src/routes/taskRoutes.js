const express = require('express');
const taskController = require('../controllers/taskController');
const router = express.Router();


// GET all task
router.get('/tasks', taskController.getAllTask);

// PUT (update) an existing task by ID
router.put('/tasks/:id', taskController.updateTask);

// PUT (update status of a task) by ID
router.put('/tasks/approve/:id', taskController.updateTaskStatus);

// POST a new task (create)
router.post('/tasks', taskController.createTask);

module.exports = router;