/**
 * Name: MathGoesRetro
 * Author: Melvyn Wilbert Tjandra
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Controller for handling game statistics-related requests, including fetching, 
 * creating, updating game stats, retrieving high scores, and generating the leaderboard.
 */

const GameStats = require('../entities/GameStats');
const pool = require('../config/db');

// Fetch all game stats
exports.getAllGameStats = async (req, res) => {
    try {
        const gameStats = await GameStats.getAllGameStats();
        res.json(gameStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new game stat
exports.createGameStat = async (req, res) => {
    const { user_highscore, max_level, correct_answers, multiplier, user_id, game_id } = req.body;
    try {
        const gameStat = await GameStats.createGameStat({ user_highscore, max_level, correct_answers, multiplier, user_id, game_id });
        res.status(201).json(gameStat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Updates user_highscore, correct_answers, and max_level
exports.updateGameStats = async (req, res) => {
    const { userId, gameId } = req.params;
    const { new_highscore, new_correct_answers, currentLevel, counterCorrect } = req.body;

    try {
        // Fetch current GameStats and Game data
        const gameStatsResult = await pool.query(
            `SELECT user_highscore, correct_answers, max_level 
            FROM "GameStats" 
            WHERE user_id = $1 AND game_id = $2`,
            [userId, gameId]
        );

        if (gameStatsResult.rowCount === 0) {
            return res.status(404).json({ message: "GameStats not found." });
        }

        const { user_highscore, correct_answers, max_level } = gameStatsResult.rows[0];

        // Retrieve correct_per_level from the Game table
        const gameResult = await pool.query(
            `SELECT correct_per_level FROM "Game" WHERE game_id = $1`,
            [gameId]
        );

        if (gameResult.rowCount === 0) {
            return res.status(404).json({ message: "Game data not found." });
        }

        const { correct_per_level } = gameResult.rows[0];

        // Parse user_highscore and correct_answers into arrays
        let highscores = user_highscore ? user_highscore.split(',').map(Number) : [];
        let correctAnswers = correct_answers ? correct_answers.split(',').map(Number) : [];

        const levelIndex = currentLevel - 1;

        // Update user_highscore and correct_answers
        if (highscores[levelIndex] === undefined) {
            highscores.push(new_highscore); // Append new highscore if level is new
            correctAnswers.push(new_correct_answers); // Append correct_answers
        } else {
            highscores[levelIndex] = Math.max(highscores[levelIndex], new_highscore);
            correctAnswers[levelIndex] = Math.max(correctAnswers[levelIndex], new_correct_answers);
        }

        // Update max_level only if conditions are met
        let updatedMaxLevel = max_level;
        if (currentLevel === max_level && counterCorrect >= correct_per_level) {
            updatedMaxLevel = max_level + 1;
        }

        // Convert arrays back to comma-separated strings
        const updatedHighscores = highscores.join(',');
        const updatedCorrectAnswers = correctAnswers.join(',');

        // Update the database
        const updateResult = await pool.query(
            `UPDATE "GameStats" 
             SET user_highscore = $1, correct_answers = $2, max_level = $3
             WHERE user_id = $4 AND game_id = $5
             RETURNING *`,
            [updatedHighscores, updatedCorrectAnswers, updatedMaxLevel, userId, gameId]
        );

        res.json({ message: "GameStats updated successfully", data: updateResult.rows[0] });
    } catch (error) {
        console.error("Error updating GameStats:", error);
        res.status(500).json({ message: "Failed to update GameStats." });
    }
};

// Retrieves total highscore by summing comma-separated values in user_highscore for a specific user in a specific game
exports.getTotalHighscoreForUser = async (req, res) => {
    const { userId, gameId } = req.params;
    try {
        const totalHighscore = await GameStats.getTotalHighscoreForUser(userId, gameId);
        res.json({ total_highscore: totalHighscore });
    } catch (error) {
        console.error('Error fetching total highscore:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Retrieves max_level and user_highscore for a specific user in a specific game
exports.getStatsForUser = async (req, res) => {
const { userId, gameId } = req.params;
try {
    // Fetch basic stats (max_level and raw user_highscore)
    const result = await GameStats.getStatsForUser(userId, gameId);
    if (!result) {
        return res.status(404).json({ message: 'User not found' });
    }
    // Calculate total_highscore
    const totalHighscore = await GameStats.getTotalHighscoreForUser(userId, gameId);
    // Include total_highscore in the response
    res.json({
        max_level: result.max_level,
        total_highscore: totalHighscore, // Add calculated total_highscore
    });
} catch (error) {
    res.status(500).json({ message: error.message });
}
};

// Retrieves user_highscore and correct_answers from the GameStats table for a specific user in a specific game
exports.getHighscoresPerLevel = async (req, res) => {
const { userId, gameId } = req.params;
try {
    const highscores = await GameStats.getHighscoresPerLevel(userId, gameId);
    res.json(highscores); // Returns [{ level: 1, score: 1000, correct_answers: 5 }, ...]
} catch (error) {
    res.status(500).json({ message: error.message });
}
};

// Retrieves all usernames and their associated total highscore of all games sorted by descending values
exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await GameStats.getLeaderboard();
        res.json(leaderboard); // Send leaderboard as JSON
    } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
};
