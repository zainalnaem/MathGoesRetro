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