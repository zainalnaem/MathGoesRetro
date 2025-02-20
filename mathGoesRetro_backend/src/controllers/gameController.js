/**
 * Name: MathGoesRetro
 * Author: Gonçalo Oliveira Cardoso
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Controller for handling game-related requests, including retrieving all games from the database.
 */

const Game = require('../entities/Game');

// GET all Games
exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.getAllGames();
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};