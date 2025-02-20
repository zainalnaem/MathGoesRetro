/**
 * Name: MathGoesRetro
 * Author: Gonçalo Oliveira Cardoso, Melvyn Wilbert Tjandra, Paul Schöpfer, Zain Aldin Zaher Alnaem
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Sets up an Express.js server with CORS enabled and environment variables loaded.
 * It includes routes for user, task, game, and game statistics management. 
 * The server listens on a specified port (default 3000).
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const gameStatsRoutes = require('../src/routes/gameStatsRoutes');
const gameRoutes = require('./routes/gameRoutes');


dotenv.config();
const app = express();

// Enable CORS for all origins
app.use(cors());

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api', userRoutes, taskRoutes, gameStatsRoutes, gameRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});