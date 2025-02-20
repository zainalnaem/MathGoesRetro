/**
 * Name: MathGoesRetro
 * Author: Gonçalo Oliveira Cardoso
 * License: GPLv3
 * Date: 20.02.2025
 */
/**
 * Handles game-related operations, including retrieving all games from the database.
 */

const pool = require('../config/db');

const Game = {
    async getAllGames() {
        const result = await pool.query('SELECT * FROM "Game"');
        return result.rows;
    }
};

module.exports = Game;