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