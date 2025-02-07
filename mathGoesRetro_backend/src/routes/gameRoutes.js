const express = require('express');
const gameController = require('../controllers/gameController');
const router = express.Router();

// GET all games
router.get('/games', gameController.getAllGames);

module.exports = router;