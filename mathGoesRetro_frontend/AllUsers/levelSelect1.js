/**
 * Name: MathGoesRetro
 * Author: Melvyn Wilbert Tjandra
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Manages level selection for the Math Mamba game.
 * Fetches user progress, high scores, and dynamically generates levels.
 * Redirects users to the correct game level or displays a lock message.
 */

document.addEventListener("DOMContentLoaded", async () => {
    const totalScoreElement = document.getElementById("totalScore");

    // Replace with actual logic to fetch the user ID
    const userId = localStorage.getItem("user_id");

    // Define or fetch gameId dynamically (currently hardcoded for testing)
    const gameId = 1;

    // Fetch the level_num for the specified game
    const levelNum = await fetchGame(gameId);

    if (levelNum === 0) {
        console.error("Game data not found. Unable to load levels.");
        alert("Game data not available!");
        return;
    }

    // Fetch total highscore and max_level
    const { max_level, total_highscore } = await fetchGameStats(userId, gameId);
    totalScoreElement.textContent = `${total_highscore} pts`;

    // Fetch individual scores for levels
    const highscores = await fetchHighscores(userId, gameId);

    // Dynamically generate levels based on levelNum
    generateLevels(levelNum, highscores, max_level);

    // Fetch user_highscore for a specific user and game ID
    async function fetchHighscores(userId, gameId) {
        try {
            const response = await fetch(
                `http://localhost:3000/api/gameStats/user/${userId}/game/${gameId}/highscores`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch highscores");
            }
            return await response.json(); // Array of { level, score }
        } catch (error) {
            console.error(error);
            return []; // Return empty array on failure
        }
    }

    // Fetch the user's total high score and max_level
    async function fetchGameStats(userId, gameId) {
        try {
            const response = await fetch(
                `http://localhost:3000/api/gameStats/user/${userId}/game/${gameId}/stats`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch game stats");
            }
            return await response.json(); // { max_level, total_highscore }
        } catch (error) {
            console.error(error);
            return { max_level: 0, total_highscore: 0 }; // Default fallback
        }
    }

    // Fetch all games and filter for a specific game ID
    async function fetchGame(gameId) {
        try {
            const response = await fetch(`http://localhost:3000/api/games`);
            if (!response.ok) {
                throw new Error("Failed to fetch games");
            }
            const games = await response.json();

            // Filter for the specific gameId and return level_num
            const game = games.find((game) => game.game_id === gameId);
            return game ? game.level_num : 0; // Return level_num or 0 if not found
        } catch (error) {
            console.error(error);
            return 0; // Default fallback
        }
    }

    // Function to dynamically generate levels
    function generateLevels(levelNum, highscores, max_level) {
        const levelsContainer = document.querySelector(".level-list");
        levelsContainer.innerHTML = ""; // Clear existing levels

        if (!Array.isArray(highscores)) {
            console.error("Highscores is not an array:", highscores);
            return;
        }

        for (let i = 1; i <= levelNum; i++) {
            const levelElement = document.createElement("div");
            levelElement.classList.add("level");
            levelElement.dataset.level = i;

            const highscore = highscores.find((hs) => hs.level === i);
            const score = highscore ? highscore.score : 0;

            if (i <= max_level) {
                levelElement.classList.add(i === max_level ? "active" : "completed");
                levelElement.innerHTML = `
                    <p>Level ${i}</p>
                    <p>${score} pts</p>
                `;
            } else {
                levelElement.classList.add("locked");
                levelElement.innerHTML = `
                    <p>Level ${i}</p>
                    <div class="lock-icon">🔒</div>
                `;
            }

            // Add click event listener for each level
            levelElement.addEventListener("click", () => {
                if (levelElement.classList.contains("locked")) {
                    const warningPopup = document.getElementById("warningPopup");
                    warningPopup.classList.remove("hidden");

                    const closeWarning = document.getElementById("closeWarning");
                    closeWarning.addEventListener("click", () => {
                        warningPopup.classList.add("hidden");
                    });
                } else {
                    const currentLevel = levelElement.dataset.level; // Get the current level
                    // Redirect to the game engine with the current level in the query parameter
                    window.location.href = `../GameEngine/indexMathMamba.html?level=${currentLevel}`;
                }
            });

            levelsContainer.appendChild(levelElement);
        }
    }
});


// Redirect if not logged in
const userId = localStorage.getItem('user_id');
if (!userId) {
    alert("You must be logged in to access this page.");
    window.location.href = 'index.html'; // Redirect to login page
}