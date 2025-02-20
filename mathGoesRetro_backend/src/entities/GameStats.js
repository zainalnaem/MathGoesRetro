/**
 * Name: MathGoesRetro
 * Author: Melvyn Wilbert Tjandra
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles game statistics operations such as retrieving all stats, creating, updating, 
 * and calculating high scores, as well as fetching user-specific stats and the leaderboard.
 */

const pool = require('../config/db');

const GameStats = {
    // Retrieve all game stats
    async getAllGameStats() {
        const result = await pool.query(`SELECT * FROM "GameStats"`);
        return result.rows;
    },

    // Create a new game stat
    async createGameStat({ user_highscore, max_level, correct_answers, multiplier, user_id, game_id }) {
        const result = await pool.query(
            `INSERT INTO "GameStats" (user_highscore, max_level, correct_answers, multiplier, user_id, game_id) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [user_highscore, max_level, correct_answers, multiplier, user_id, game_id]
        );
        return result.rows[0];
    },

    // Update an existing game stat
    async updateGameStat(gamest_id, { user_highscore, max_level, correct_answers, multiplier }) {
        const result = await pool.query(
            `UPDATE "GameStats"
            SET user_highscore = $1, max_level = $2, correct_answers = $3, multiplier = $4
            WHERE gamest_id = $5 RETURNING *`,
            [user_highscore, max_level, correct_answers, multiplier, gamest_id]
        );
        return result.rows[0];
    },

    // Retrieves total highscore by summing comma-separated values in user_highscore for a specific user in a specific game
    async getTotalHighscoreForUser(userId, gameId) {
        const result = await pool.query(
            `SELECT 
        SUM(value::int) AS total_highscore
        FROM 
        (
            SELECT unnest(string_to_array(user_highscore, ',')) AS value
            FROM "GameStats"
            WHERE user_id = $1 AND game_id = $2
        ) AS scores`,
            [userId, gameId]
        );
        return result.rows[0]?.total_highscore || 0; // Return 0 if no rows found
    },

    // Retrieves max_level and user_highscore for a specific user in a specific game
    async getStatsForUser(userId, gameId) {
        const result = await pool.query(
            `SELECT max_level, user_highscore
        FROM "GameStats" 
        WHERE user_id = $1 AND game_id = $2`,
            [userId, gameId]
        );
        return result.rows[0];
    },

    // Retrieves user_highscore and correct_answers from the GameStats table for a specific user in a specific game
    async getHighscoresPerLevel(userId, gameId) {
        const result = await pool.query(
            `SELECT
            unnest(string_to_array(user_highscore, ','))::int AS score,
            unnest(string_to_array(correct_answers, ','))::int AS correct_answers,
            generate_series(1, array_length(string_to_array(user_highscore, ','), 1)) AS level
        FROM "GameStats"
        WHERE user_id = $1 AND game_id = $2`,
            [userId, gameId]
        );
        return result.rows; // Returns an array of objects { score: 5000, correct_answers: 10, level: 1 }
    },

    // Retrieves all usernames and their associated total highscore of all games sorted by descending values
    async getLeaderboard() {
        const result = await pool.query(`
        WITH unnest_scores AS (
            SELECT
                u.username,
                gs.user_id,
                unnest(string_to_array(gs.user_highscore, ',')::int[]) AS score
            FROM
                "GameStats" gs
            JOIN
                "User" u
            ON
                gs.user_id = u.user_id
        )
        SELECT
            username,
            SUM(score) AS total_score
        FROM
            unnest_scores
        GROUP BY
            username
        ORDER BY
            total_score DESC
    `);
        return result.rows; // Return the leaderboard as an array of { username, total_score }
    }

};

module.exports = GameStats;