/**
 * Name: MathGoesRetro
 * Author: Melvyn Wilbert Tjandra
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles game statistics-related requests, including retrieving, creating, updating,
 * and querying stats for specific users and games, as well as fetching the leaderboard.
 */

const express = require('express');
const gamestatsController = require('../controllers/gameStatsController');
const router = express.Router();

// GET all gameStats
router.get('/gameStats', gamestatsController.getAllGameStats);

// POST a new gameStat (create)
router.post('/gameStats', gamestatsController.createGameStat);

// PUT (update) an existing GameStat by user ID and game ID 
router.put('/gameStats/user/:userId/game/:gameId', gamestatsController.updateGameStats);

// GET total_highscore for a specific user
router.get('/gameStats/user/:userId/game/:gameId/totalHighscore', gamestatsController.getTotalHighscoreForUser);

// GET max_level and user_highscore for a specific user
router.get('/gameStats/user/:userId/game/:gameId/stats', gamestatsController.getStatsForUser);

// GET individual entries in user_highscore for a specific user
router.get('/gameStats/user/:userId/game/:gameId/highscores', gamestatsController.getHighscoresPerLevel);

// Get leaderboard
router.get('/gameStats/leaderboard', gamestatsController.getLeaderboard);

module.exports = router;
