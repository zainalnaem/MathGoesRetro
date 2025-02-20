/**
 * Name: MathGoesRetro
 * Author: Melvyn Wilbert Tjandra
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Manages tab navigation and loads user game statistics,
 * including fetching highscores and game-specific stats dynamically.
 */

document.addEventListener("DOMContentLoaded", async () => {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    const userId = localStorage.getItem("user_id") || 1;

    // Fetch correct_per_level for the specified game ID
    async function fetchGame(gameId) {
        try {
            const response = await fetch(`http://localhost:3000/api/games`);
            if (!response.ok) {
                throw new Error("Failed to fetch games");
            }
            const games = await response.json();

            // Filter for the specific gameId and return correct_per_level
            const game = games.find((game) => game.game_id === parseInt(gameId, 10));
            return game ? game.correct_per_level : 0; // Return correct_per_level or 0 if not found
        } catch (error) {
            console.error("Error in fetchGame:", error.message);
            return 0; // Default fallback
        }
    }

    // Function to fetch individual scores for levels
    async function fetchHighscores(userId, gameId) {
        try {
            console.log(`Fetching highscores for user ${userId}, game ${gameId}`);
            const response = await fetch(`http://localhost:3000/api/gameStats/user/${userId}/game/${gameId}/highscores`);
            if (!response.ok) {
                throw new Error(`Failed to fetch highscores: ${response.status}`);
            }
            return await response.json(); // Array of { level, score, correct_answers }
        } catch (error) {
            console.error("Error fetching highscores:", error.message);
            return []; // Return empty array on failure
        }
    }

    // Function to load stats for a specific game
    async function loadGameStats(userId, gameId, tabContentId) {
        const highscores = await fetchHighscores(userId, gameId);
        const correctPerLevel = await fetchGame(gameId); // Fetch correct_per_level for the game

        // Get the target tab content
        const tabContent = document.getElementById(tabContentId);
        const totalScoreElement = tabContent.querySelector(".total-score span");
        const statsTableBody = tabContent.querySelector(".stats-table tbody");

        // Reset the table content
        statsTableBody.innerHTML = "";

        // Populate the stats
        let totalScore = 0;
        highscores.forEach(({ level, score, correct_answers }) => {
            totalScore += score;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${level}</td>
                <td>${score}</td>
                <td>${correct_answers}</td>
            `;
            statsTableBody.appendChild(row);
        });

        // Update the total score
        totalScoreElement.textContent = `${totalScore} pts`;
    }

    // Tab switching logic
    tabButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const targetTab = button.getAttribute("data-tab");
            const gameId = button.getAttribute("data-game"); // Game ID is set in the button

            console.log(`Switching to game ${gameId}`); // Debugging log for active gameId

            // Remove active class from all buttons and contents
            tabButtons.forEach((btn) => btn.classList.remove("active"));
            tabContents.forEach((content) => content.classList.remove("active"));

            // Add active class to the clicked button and corresponding content
            button.classList.add("active");
            document.getElementById(targetTab).classList.add("active");

            // Load stats for the selected game
            await loadGameStats(userId, gameId, targetTab);
        });
    });

    // Show the first tab by default
    tabButtons[0].click();
});

// Redirect if not logged in
const userId = localStorage.getItem('user_id');
if (!userId) {
    alert("You must be logged in to access this page.");
    window.location.href = 'index.html'; // Redirect to login page
}