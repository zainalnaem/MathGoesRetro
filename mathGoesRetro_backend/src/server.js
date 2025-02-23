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
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const gameStatsRoutes = require('../src/routes/gameStatsRoutes');
const gameRoutes = require('./routes/gameRoutes');


dotenv.config();
const app = express();

// Enable CORS for all origins
app.use(cors());
app.use(cors({ origin: '*' })); // Allow all origins

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api', userRoutes, taskRoutes, gameStatsRoutes, gameRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../mathGoesRetro_frontend')));

// Serve index.html for all unknown routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../mathGoesRetro_frontend/AllUsers/index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});