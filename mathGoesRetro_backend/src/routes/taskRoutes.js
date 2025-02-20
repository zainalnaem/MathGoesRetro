/**
 * Name: MathGoesRetro
 * Author: Paul Schöpfer
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles task-related requests, including retrieving, creating, updating, and editing tasks.
 */

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

// PUT (update question and answers of a task) by ID
router.put('/tasks/edit/:id', taskController.updateTaskContent);

module.exports = router;