/**
 * Name: MathGoesRetro
 * Author: Gonçalo Oliveira Cardoso
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles requests related to games, including retrieving all games from the database.
 */

const express = require('express');
const gameController = require('../controllers/gameController');
const router = express.Router();

// GET all games
router.get('/games', gameController.getAllGames);

module.exports = router;