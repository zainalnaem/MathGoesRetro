/**
 * Name: MathGoesRetro
 * Author: Zain Aldin Zaher Alnaem
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Controller for handling user-related requests, including fetching, creating, updating, 
 * deleting users, login authentication, account status updates, and password reset functionality.
 */

const User = require('../entities/User');

// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET a specific user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  const { username, email, password, role, account_status } = req.body;
  try {
    const user = await User.createUser({ username, email, password, role, account_status });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT (Update) an existing user by ID
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role, account_status } = req.body;
  try {
    const updatedUser = await User.updateUser(id, { username, email, password, role, account_status });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a user by ID
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.deleteUser(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// POST - Login user
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.verifyUserCredentials(username, password);
    
    res.json({
      message: 'Login successful',
      user: user, 
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

exports.updateAccountStatus = async (req, res) => {
  const { id } = req.params;
  const { account_status } = req.body; // Only account_status is required in the request body

  if (!account_status) {
    return res.status(400).json({ message: 'account_status is required' });
  }

  try {
    const updatedUser = await User.updateAccountStatus(id, account_status);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      message: 'User account status updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.sendResetEmail = async (req, res) => {
  const { email } = req.body; // Get email from the request body

  try {
      const message = await User.updatePasswordByUsername(email);
      res.status(200).json({ message });
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
};