/**
 * Name: MathGoesRetro
 * Author: Zain Aldin Zaher Alnaem
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles user-related requests, including registration, login, retrieval, updates, deletions,
 * account management, and password reset functionality.
 */

const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();


// GET all users
router.get('/users', userController.getAllUsers);

// POST a new user (create)
router.post('/users/register', userController.createUser);

// GET a specific user by ID
router.get('/users/:id', userController.getUserById);

// PUT (update) an existing user by ID
router.put('/users/:id', userController.updateUser);

// DELETE a user by ID
router.delete('/users/:id', userController.deleteUser);

router.post('/users/login', userController.loginUser);

// PUT (update account status of a host) by ID
router.put('/users/host/deactivate/:id', userController.updateAccountStatus);

// New route for forgot password
router.post('/users/forgot-password', userController.sendResetEmail);


module.exports = router;