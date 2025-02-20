/**
 * Name: MathGoesRetro
 * Author: Paul Schöpfer
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Controller for handling task-related requests, including retrieving, creating, 
 * updating task content, and updating task status.
 */

const Task = require('../entities/Task');

// GET all tasks
exports.getAllTask = async (req, res) => {
    try {
      const tasks = await Task.getAllTask();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // PUT (Update) an existing user by ID
exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const updatedTask = await Task.updateTask(id, { status });
      if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  exports.updateTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Only status is required in the request body
  
    if (!status) {
      return res.status(400).json({ message: 'status is required' });
    }
  
    try {
      const updatedTask = await Task.updateTaskStatus(id, status);
      if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json({
        message: 'Task status updated successfully'
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  exports.createTask = async (req, res) => {
    const { question, wrong_answer1, wrong_answer2, wrong_answer3, correct_answer, topic, difficulty, points, status, user_id } = req.body;
    try {
      const task = await Task.createTask({ question, wrong_answer1, wrong_answer2, wrong_answer3, correct_answer, topic, difficulty, points, status, user_id });
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // PUT (Update Task Content) by ID
exports.updateTaskContent = async (req, res) => {
  const { id } = req.params;
  const { question, wrong_answer1, wrong_answer2, wrong_answer3, correct_answer } = req.body;

  try {
      const updatedTask = await Task.updateTaskContent(id, { question, wrong_answer1, wrong_answer2, wrong_answer3, correct_answer });
      if (!updatedTask) {
          return res.status(404).json({ message: 'Task not found' });
      }
      res.json(updatedTask);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};