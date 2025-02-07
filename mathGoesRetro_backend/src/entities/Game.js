const pool = require('../config/db');

const Game = {
    async getAllGames() {
        const result = await pool.query('SELECT * FROM "Game"');
        return result.rows;
    }
};

module.exports = Game;