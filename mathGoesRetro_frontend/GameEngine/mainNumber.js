/**
 * Name: MathGoesRetro
 * Author: Zain Aldin Zaher Alnaem
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles the core logic for the Number Kruncher game, including game initialization, 
 * the main loop, player controls, collision detection, scoring, and level progression.
 */

import { 
    canvas, BLOCK_SIZE, canvasWidth, canvasHeight, 
    innerWidth, innerHeight, questionDisplay, scoreDisplay, 
    BORDER_MARGIN
} from './globalsKruncher.js';
import { 
    initializeSquares, answerSquares, squarePlayer, 
    createCorrectAnswerSquare, correctAnswerSquare,
    createWrongAnswersSquare, fetchTasks, loadRandomTask, question, tasks, correctAnswerColor
} from './squaresKruncher.js';
import { keyControl } from './keyControlsKruncher.js';
import { gameOverSound, pointsSound } from './sound.js';
import { getColorByName } from './c64Colors.js';

// Reference canvas = document.getElementById("canvas") takes place in globals.js
const ctx = canvas.getContext("2d");

let lastFrameTime = 0;          // Timestamp of the last frame
const FRAME_DURATION = 150  ;     // Duration of a frame in milliseconds (150 ms = 6.67 frames per second)
let isGameRunning = true;       // Controls the game loop

let kruncher;                // Player square

let ghosts = [
    {
        x: 243, // Initial position
        y: 183,
        width: BLOCK_SIZE,
        height: BLOCK_SIZE,
        direction: "RIGHT", // Initial direction
        speed: BLOCK_SIZE, // Movement speed
        fillColor: getColorByName("Blue"), // Ghost color
    },
    {
        x: 243, // Initial position
        y: 243,
        width: BLOCK_SIZE,
        height: BLOCK_SIZE,
        direction: "LEFT", // Initial direction
        speed: BLOCK_SIZE, // Movement speed
        fillColor: getColorByName("Blue"), // Ghost color
    },
    {
        x: 243, // Initial position for the third ghost
        y: 303,
        width: BLOCK_SIZE,
        height: BLOCK_SIZE,
        direction: "LEFT", // Initial direction
        speed: BLOCK_SIZE, // Movement speed
        fillColor: getColorByName("Blue"), // Third ghost color
    },
];

export const walls = [
    { x: 243, y: 3, width: BLOCK_SIZE, height: BLOCK_SIZE },

    { x: 33, y: 33, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 63, y: 33, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 123, y: 33, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 153, y: 33, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 183, y: 33, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 243, y: 33, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 303, y: 33, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 333, y: 33, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 363, y: 33, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 423, y: 33, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 453, y: 33, width: BLOCK_SIZE, height: BLOCK_SIZE },

    { x: 33, y: 93, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 63, y: 93, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 123, y: 93, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 183, y: 93, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 213, y: 93, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 243, y: 93, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 273, y: 93, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 303, y: 93, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 363, y: 93, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 423, y: 93, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 453, y: 93, width: BLOCK_SIZE, height: BLOCK_SIZE },

    { x: 123, y: 123, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 243, y: 123, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 363, y: 123, width: BLOCK_SIZE, height: BLOCK_SIZE },

    { x: 3, y: 153, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 33, y: 153, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 63, y: 153, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 123, y: 153, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 153, y: 153, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 183, y: 153, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 243, y: 153, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 303, y: 153, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 333, y: 153, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 363, y: 153, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 423, y: 153, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 453, y: 153, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 483, y: 153, width: BLOCK_SIZE, height: BLOCK_SIZE },

    { x: 63, y: 183, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 123, y: 183, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 363, y: 183, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 423, y: 183, width: BLOCK_SIZE, height: BLOCK_SIZE },

    { x: 3, y: 213, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 63, y: 213, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 123, y: 213, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 183, y: 213, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 213, y: 213, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 243, y: 213, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 273, y: 213, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 303, y: 213, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 363, y: 213, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 423, y: 213, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 483, y: 213, width: BLOCK_SIZE, height: BLOCK_SIZE },

    { x: 3, y: 273, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 33, y: 273, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 63, y: 273, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 123, y: 273, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 183, y: 273, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 213, y: 273, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 243, y: 273, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 273, y: 273, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 303, y: 273, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 363, y: 273, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 423, y: 273, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 453, y: 273, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 483, y: 273, width: BLOCK_SIZE, height: BLOCK_SIZE },

    { x: 63, y: 303, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 123, y: 303, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 363, y: 303, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 423, y: 303, width: BLOCK_SIZE, height: BLOCK_SIZE },

    { x: 3, y: 333, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 63, y: 333, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 123, y: 333, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 183, y: 333, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 213, y: 333, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 243, y: 333, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 273, y: 333, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 303, y: 333, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 363, y: 333, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 423, y: 333, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 483, y: 333, width: BLOCK_SIZE, height: BLOCK_SIZE },

    { x: 243, y: 363, width: BLOCK_SIZE, height: BLOCK_SIZE },

    { x: 33, y: 393, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 63, y: 393, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 123, y: 393, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 153, y: 393, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 183, y: 393, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 243, y: 393, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 303, y: 393, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 333, y: 393, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 363, y: 393, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 423, y: 393, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 453, y: 393, width: BLOCK_SIZE, height: BLOCK_SIZE },

    { x: 63, y: 423, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 423, y: 423, width: BLOCK_SIZE, height: BLOCK_SIZE },

    { x: 3, y: 453, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 63, y: 453, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 123, y: 453, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 183, y: 453, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 213, y: 453, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 243, y: 453, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 273, y: 453, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 303, y: 453, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 363, y: 453, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 423, y: 453, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 483, y: 453, width: BLOCK_SIZE, height: BLOCK_SIZE },

    { x: 123, y: 483, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 363, y: 483, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 243, y: 483, width: BLOCK_SIZE, height: BLOCK_SIZE },
];

// Score increments by 1 for each correct answer, but multiplied by 10 for display
export let score = 0;
export let currentDifficulty = 1;
export let counterCorrect = 0;
let correctAnswersPerLevel = 3;

// !! Should be fetched from entity game later !!
// c for complex, d for derivative, r for radiant
export let mathTopic = "d"; // Default to derivative

// Function to retrieve the selected level from URL and log it to the console
function getSelectedLevel() {
    const urlParams = new URLSearchParams(window.location.search);
    const level = parseInt(urlParams.get("level"), 10); // Get level from URL as an integer
    return isNaN(level) ? 1 : level; // Default to level 1 if not found or invalid
}

export let currentLevel = getSelectedLevel(); // Retrieve and store the current level

// Initialize the game
async function initializeGame() {
        currentDifficulty = currentLevel;  // Explicitly set difficulty to match level at the start
    await fetchTasks();
    if (tasks.length === 0) {
        console.error("No tasks available.");
        return;
    }

    loadRandomTask();

     // Clear existing answer squares and obstacles
        answerSquares.splice(0, answerSquares.length);  // Clear any lingering answers
    // Initialize the player and squares square for correct answer and wrong answers
    initializeSquares();
    kruncher = squarePlayer;


     if (currentLevel === 1 || currentLevel === 4 || currentLevel === 7) {
            currentDifficulty = 1; // Switch to Level 1
            counterCorrect = 0; // Reset counter
        } else if (currentLevel === 2 || currentLevel === 5 || currentLevel === 8) {
            currentDifficulty = 2; // Switch to Level 2
            counterCorrect = 0; // Reset counter
        } else if (currentLevel === 3 || currentLevel === 6 || currentLevel === 9) {
            currentDifficulty = 3; // Switch to Level 3
            counterCorrect = 0; // Reset counter
        }
    
    keyControl();        // Enable controls (keyboard or touch)
    updateScore();       // Show score from the beginning
    updateQuestion();    // Show question from the beginning

}

// Score is multiplied by 10 for display
function updateScore() {
    scoreDisplay.textContent = 'Score: ' + score*10;
}

export function updateQuestion() {
    const questionDisplayElement = questionDisplay;

    // Delete old entries
    questionDisplayElement.innerHTML = '';

    // Apply KaTex again
    katex.render(question, questionDisplayElement, {
        throwOnError: false,  // Don't throw errors if sth doesn't work
    });
}

// Main game loop
function gameLoop(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;

    const deltaTime = timestamp - lastFrameTime;

    if (deltaTime >= FRAME_DURATION) {
        lastFrameTime = timestamp;

        clearCanvas();

         // Check if player collides with ghost
         if (checkCollisionsWithGhost()) {
            stopGame();
            return;
        }
        // Check collisions with square for wrong answer or self (Game Over)
        if (checkCollisionsKruncher()) {
            stopGame();
            return;
        }

        movePlayer();    // Move the player (snake)
        moveGhost();
        drawGameElements();   // Draw all game elements
    }

    if (isGameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function drawWalls() {
    walls.forEach(wall => {
        ctx.fillStyle = getColorByName('Grey'); // Color of the walls
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
}

function drawKruncher() {
     // Draw player square
     if (squarePlayer) {
        squarePlayer.drawRect(ctx);
    }
    ctx.fillStyle = kruncher.fillColor;
    ctx.fillRect(kruncher.x, kruncher.y, kruncher.width, kruncher.height);
}


function drawGameElements() {
    drawWalls();                        // Draw the walls
    drawKruncher();                     // Draw the player
    drawGhost();                        // Draw the ghost
    drawCorrectAnswerSquare();          // Draw the square for correct answer 
    drawWrongAnswerSquares();           // Draw all squares for wrong answers
}

function drawGhost() {
    // Check if the current level is 3, 6, or 9
    const shouldDrawAllGhosts = (currentLevel === 3 || currentLevel === 6 || currentLevel === 9);
 
    ghosts.forEach((ghost, index) => {
        // Draw the first two ghosts always, and draw the third ghost conditionally
        if (index < 2 || shouldDrawAllGhosts) {
            // Begin the path for drawing
            ctx.beginPath();
            
            // Draw a circle at the ghost's position, with the width/2 as radius
            ctx.arc(ghost.x + ghost.width / 2, ghost.y + ghost.height / 2, ghost.width / 2, 0, 2 * Math.PI);
            
            // Set the color of the ghost
            ctx.fillStyle = ghost.fillColor;
            
            // Fill the circle with the color
            ctx.fill();
            
            // Close the path after drawing the circle
            ctx.closePath();
        }
    });
 }

function drawCorrectAnswerSquare() {    
    answerSquares.forEach(square => {
        if (square.isCorrectAnswer) 
            square.drawRect(ctx);       // Draw the square for wrong answer
    });
}

function drawWrongAnswerSquares() {
    answerSquares.forEach(square => {
        if (square.isWrongAnswer) 
            square.drawRect(ctx);       // Draw the square for wrong answer
    });
}

function checkCollisionsKruncher() {
    return collisionWithWrongAnswerSquare(kruncher);
}

// Validate, if head crashes with square for wrong answer
function collisionWithWrongAnswerSquare(kruncher) {
return answerSquares.some(
    square => square.isWrongAnswer &&
    square.x === kruncher.x && square.y === kruncher.y);
}

function stopGame() {
    isGameRunning = false;       // Stop the game loop
    showGameOverPopup();       // Show "GAME OVER" message
    gameOverSound.play();        // Play the Game Over sound

    // Update stats on game over
    updateGameStats(score, counterCorrect, currentLevel, counterCorrect);
}
function showGameOverPopup() {
    const gameOverPopup = document.getElementById("gameOverPopup");
    const restartButton = document.getElementById("restartButton");
    const homeButton = document.getElementById("homeButton");

    // Show the popup
    gameOverPopup.classList.remove("hidden");

    // Add event listeners for the buttons
    restartButton.onclick = () => {
        location.reload(); // This will reload the current page
    };

    homeButton.onclick = () => {
        window.location.href = "../AllUsers/levelSelect2.html"; // Redirect to home
    };
}

function showLevelUpPopup() {
    const levelUpPopup = document.getElementById("levelUpPopup");
    const continueButton = document.getElementById("continueButton");
    const homeButton = document.getElementById("homeButton1");

    // Show the popup
    levelUpPopup.classList.remove("hidden");
    isGameRunning = false; // Stop the game loop

    // Pause the game logic (e.g., by ensuring no updates happen while paused)
    cancelAnimationFrame(gameLoop); // Stop the animation frame loop

    // Add event listener for continue button to allow playing the same level
    continueButton.onclick = () => {
        levelUpPopup.classList.add("hidden");
        isGameRunning = true; // Resume the game loop
        requestAnimationFrame(gameLoop);
    };

    // Add event listener for home button to go to the home screen
    homeButton.onclick = () => {
        window.location.href = "../AllUsers/levelSelect2.html"; // Redirect to home
        stopGame();
    };
}
// function showGameOverMessage() {
//     ctx.save();
//     ctx.globalAlpha = 1.0;                          // Fully opaque
//     ctx.fillStyle = getColorByName('Lavender');                          // Red color for the message
//     ctx.font = "60px ComputerPixel";               // Font size and style
//     ctx.textAlign = "center";                       // Align text in the center
//     ctx.textBaseline = "middle";                    // Vertical alignment
//     ctx.shadowColor = getColorByName('Lavender');
//     ctx.shadowBlur = 20;                            // Blurring for glow effect
//     ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2); // Display the message
//     ctx.restore();
// }

async function updateGameStats(score, correctAnswers, currentLevel, counterCorrect) {
    const userId = localStorage.getItem("user_id");
    const gameId = 2; // Replace with dynamic gameId if necessary

    if (!userId || !gameId) {
        console.error("Missing userId or gameId");
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/api/gameStats/user/${userId}/game/${gameId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                new_highscore: score*10,
                new_correct_answers: correctAnswers,
                currentLevel: currentLevel,
                counterCorrect: counterCorrect,
            }),
        });

        const result = await response.json();
    } catch (error) {
        console.error("Error updating game stats:", error);
    }
}

// Move player square based on direction
function movePlayer() {
    if (!isGameRunning) return;

    let newX = kruncher.x;
    let newY = kruncher.y;

    // Allow movement in all directions directly
    if (window.RIGHT) newX += BLOCK_SIZE;
    if (window.LEFT) newX -= BLOCK_SIZE;
    if (window.UP) newY -= BLOCK_SIZE;
    if (window.DOWN) newY += BLOCK_SIZE;

    // Prevent player from moving beyond the borders
    if (newX < BORDER_MARGIN) newX = BORDER_MARGIN;
    if (newX >= canvasWidth - BLOCK_SIZE - BORDER_MARGIN) newX = canvasWidth - BLOCK_SIZE - BORDER_MARGIN;
    if (newY < BORDER_MARGIN) newY = BORDER_MARGIN;
    if (newY >= canvasHeight - BLOCK_SIZE - BORDER_MARGIN) newY = canvasHeight - BLOCK_SIZE - BORDER_MARGIN;

    // Check if the new position would collide with a wall
    if (!collisionWithWalls({ x: newX, y: newY, width: BLOCK_SIZE, height: BLOCK_SIZE })) {
        // Update position only if there's no collision
        kruncher.x = newX;
        kruncher.y = newY;
    }


    /*
    // Wrap around when touching borders (remove the 4 if statements above (**) to apply this feature)
    if (kruncher.x < BORDER_MARGIN) {
        kruncher.x = canvasWidth - BLOCK_SIZE - BORDER_MARGIN;
    } else if (kruncher.x >= canvasWidth - BORDER_MARGIN) {
        kruncher.x = BORDER_MARGIN;
    }

    if (kruncher.y < BORDER_MARGIN) {
        kruncher.y = canvasHeight - BLOCK_SIZE - BORDER_MARGIN;
    } else if (kruncher.y >= canvasHeight - BORDER_MARGIN) {
        kruncher.y = BORDER_MARGIN;
    } */

    // Check for collisions with the correct answer square
    checkCorrectAnswerSquareCollision(kruncher);
}

function moveGhost() {
    ghosts.forEach((ghost) => {
        // Change direction randomly
        const directions = ["UP", "DOWN", "LEFT", "RIGHT"];
        if (Math.random() < 0.2) { // 20% chance to change direction
            ghost.direction = directions[Math.floor(Math.random() * directions.length)];
        }

        // Update ghost position
        if (ghost.direction === "UP") ghost.y -= ghost.speed;
        if (ghost.direction === "DOWN") ghost.y += ghost.speed;
        if (ghost.direction === "LEFT") ghost.x -= ghost.speed;
        if (ghost.direction === "RIGHT") ghost.x += ghost.speed;

        // Keep the ghost within canvas boundaries
        ghost.x = Math.max(BORDER_MARGIN, Math.min(ghost.x, innerWidth - BLOCK_SIZE + BORDER_MARGIN));
        ghost.y = Math.max(BORDER_MARGIN, Math.min(ghost.y, innerHeight - BLOCK_SIZE + BORDER_MARGIN));

        // Prevent the ghost from entering walls
        if (collisionWithWalls(ghost)) {
            if (ghost.direction === "UP") ghost.y += ghost.speed;
            if (ghost.direction === "DOWN") ghost.y -= ghost.speed;
            if (ghost.direction === "LEFT") ghost.x += ghost.speed;
            if (ghost.direction === "RIGHT") ghost.x -= ghost.speed;
        }
    });
}

// Check if the snake collides with square for correct answer - or walls or enemies
function checkCorrectAnswerSquareCollision(kruncher) {
    if (kruncher.x === correctAnswerSquare.x && kruncher.y === correctAnswerSquare.y) {
        if (correctAnswerSquare.isCorrectAnswer) {
            score++;
            if (score === 5) {
            showLevelUpPopup(); // Show the popup when score reaches 3
            }
            counterCorrect++;
            updateScore();
            pointsSound.play();

            loadRandomTask();
            updateQuestion();
            
            // Delete all answer squares
            answerSquares.splice(0, answerSquares.length);

            // Create a new square for correct answer at a random position
            createCorrectAnswerSquare(correctAnswerColor);

            // Create new squares for wrong answers at random positions
            createWrongAnswersSquare();

            return true;    // Square for correct answer was eaten
        }
        
        // If the head collides with an square for wrong answers, it doesn't grow or score
        return false;       // Square for correct answer was not eaten
    }
}

function collisionWithWalls(kruncher) {
    return walls.some(wall => 
        kruncher.x < wall.x + wall.width &&
        kruncher.x + BLOCK_SIZE > wall.x &&
        kruncher.y < wall.y + wall.height &&
        kruncher.y + BLOCK_SIZE > wall.y
    );
}

function checkCollisionsWithGhost() {
    for (let i = 0; i < ghosts.length; i++) {
        if (kruncher.x === ghosts[i].x && kruncher.y === ghosts[i].y) {
            return true; // Collision with one of the ghosts detected
        }
    }
    return false; // No collision with any ghost
}

// Start game not before DOM has been completely loaded
document.addEventListener("DOMContentLoaded", async () => {
    await initializeGame();
    requestAnimationFrame(gameLoop);
});

// Redirect if not logged in
const userId = localStorage.getItem('user_id');
if (!userId) {
alert("You must be logged in to access this page.");
window.location.href = '/mathGoesRetro_frontend/AllUsers/index.html'; // Redirect to login page
}