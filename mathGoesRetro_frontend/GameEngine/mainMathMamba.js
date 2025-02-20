/**
 * Name: MathGoesRetro
 * Author: Paul Schöpfer
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles the core logic for the Math Mamba game, including game initialization, 
 * the main loop, player controls, collision detection, scoring, and level progression.
 */

import { BLOCK_SIZE, BORDER_MARGIN } from './globals.js';
import {
    createAnswerSquares, Square, answerSquares, squarePlayerArray,
    correctAnswerSquare, obstacles, createPlayerSquareArray,
    fetchTasks, loadRandomTask, tasks,
    createObstacles
} from './squaresMamba.js';
import { keyControl } from './keyControls.js';
import { gameOverSound, pointsSound } from './sound.js';

const canvas = document.getElementById("canvasMathMamba");
export const canvasWidth = canvas.width;
export const canvasHeight = canvas.height;
const scoreDisplay = document.querySelector('.score');

const ctx = canvas.getContext("2d");

let lastFrameTime = 0;          // Timestamp of the last frame
const FRAME_DURATION = 150;     // Duration of a frame in milliseconds (150 ms = 6.67 frames per second)
let isGameRunning = true;       // Controls the game loop

let mamba;
let head;

// Score increments by 1 for each correct answer, but multiplied by 10 for display
export let score = 0;
export let currentLevel = getSelectedLevel(); // Retrieve and store the current level
const AMOUNT_OF_STAGES = 3;
export let currentStage = currentLevel % AMOUNT_OF_STAGES;
const CORRECT_ANSWERS_TO_UNLOCK_NEXT_LEVEL = 5;
export let counterCorrect = 0;
const MULTIPLIER = 10;

// !! Should be feched from entity game later !!
// c for complex, d for derivative, r for radiant
export let mathTopic = "c";

// Function to retrieve the selected level from URL and log it to the console
function getSelectedLevel() {
    const urlParams = new URLSearchParams(window.location.search);
    const level = parseInt(urlParams.get("level"), 10); // Get level from URL as an integer
    return isNaN(level) ? 1 : level; // Default to level 1 if not found or invalid
}

// Start game not before DOM has been completely loaded
document.addEventListener("DOMContentLoaded", async () => {
    await initializeGame();
    requestAnimationFrame(gameLoop);
});

// Initialize the game
async function initializeGame() {

    await fetchTasks();
    if (tasks.length === 0) {
        console.error("No tasks available.");
        return;
    }

    createPlayerSquareArray();
    mamba = squarePlayerArray;
    head = mamba[0];

    loadRandomTask();
    createAnswerSquares();

    counterCorrect = 0; // Reset counter
    console.log("LEVEL: ", currentLevel, "STAGE: ", currentStage);

    switch (currentStage) {
        case 0:
            obstacles.splice(0, obstacles.length);
            createObstacles();  // Create obstacles
            break;
    }

    keyControl();        // Enable controls (keyboard or touch)
}

// Main game loop
function gameLoop(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;

    const deltaTime = timestamp - lastFrameTime;

    if (deltaTime >= FRAME_DURATION) {
        lastFrameTime = timestamp;

        clearCanvas();

        // Check collisions with square for wrong answer or self (Game Over)
        if (checkCollisions()) {
            stopGame();
            return;
        }

        movePlayer();

        // Check collisions with square for correct answer to score points
        if (collisionWithCorrectAnswerSquare(head)) {
            loadRandomTask();

            // Delete all answer squares
            answerSquares.splice(0, answerSquares.length);

            // Create a new square for wrong and correct answers at a random position
            createAnswerSquares();
        } else {
            // Remove last segment. This simulates a movement of the mamba
            mamba.pop();
        }

        drawGameElements();
    }

    if (isGameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function checkCollisions() {
    return (
        collisionWithWall(head) ||
        collisionWithWrongAnswerSquare(head) ||
        collisionWithSelf(head, mamba.slice(1)) ||
        collisionWithObstacle(head)
    );
}

function collisionWithWall(head) {
    return (
        head.x < BORDER_MARGIN ||
        head.x >= canvasWidth - BORDER_MARGIN ||
        head.y < BORDER_MARGIN ||
        head.y >= canvasHeight - BORDER_MARGIN
    );
}

// Validate, if head crashes with square for wrong answer
function collisionWithWrongAnswerSquare(head) {
    return answerSquares.some(
        square => square.isWrongAnswer &&
            square.x === head.x && square.y === head.y);
}

// Validate, if head crashes with body of mamba
function collisionWithSelf(head, mamba) {
    return mamba.some(segment => head.x === segment.x && head.y === segment.y);
}

function collisionWithObstacle(head) {
    return obstacles.some(obstacle =>
        obstacle.x === head.x && obstacle.y === head.y);
}

// Check if the snake collides with a correct answer
function collisionWithCorrectAnswerSquare(head) {
    if (head.x === correctAnswerSquare.x && head.y === correctAnswerSquare.y) {
        score++;
        counterCorrect++;
        if (score === CORRECT_ANSWERS_TO_UNLOCK_NEXT_LEVEL) {
            showLevelUpPopup(); // Show the popup when correct answers are reached
        }

        updateScore();
        pointsSound.play();

        return true;    // Square for correct answer was eaten
    }

    return false;       // Square for correct answer was not eaten
}

function stopGame() {
    isGameRunning = false;       // Stop the game loop
    showGameOverPopup();        // Show "GAME OVER" message
    gameOverSound.play();        // Play the Game Over sound

    // Update stats on game over
    updateGameStats(score, counterCorrect, currentLevel, counterCorrect);
}

async function updateGameStats(score, correctAnswers, currentLevel, counterCorrect) {
    const userId = localStorage.getItem("user_id");
    const gameId = 1; // Replace with dynamic gameId if necessary

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
                new_highscore: score * MULTIPLIER,
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
    if (window.RIGHT) head.x += BLOCK_SIZE;
    if (window.LEFT) head.x -= BLOCK_SIZE;
    if (window.UP) head.y -= BLOCK_SIZE;
    if (window.DOWN) head.y += BLOCK_SIZE;

    if (collisionWithWall(head) || collisionWithWall(head)) {
        stopGame();
        return;
    }

    // Move the player (without immediately growing the snake)
    mamba.unshift(new Square(
        head.x,
        head.y,
        squarePlayerArray[0].width,
        squarePlayerArray[0].text,
        squarePlayerArray[0].fillColorSq,
        squarePlayerArray[0].fillColorText,
        squarePlayerArray[0].isCorrectAnswer,
        squarePlayerArray[0].isWrongAnswer,
        squarePlayerArray[0].imageSrc,
        squarePlayerArray[0].emoji,
        true
    ));
}

function drawGameElements() {

    drawMamba(); // Draw the mamba
    drawAnswerSquares();          // Draw the squares for correct and wrong answers 
    drawObstacles();                    // Draw all obstacles

}

function drawMamba() {
    mamba.forEach(segment => {
        segment.drawRect(ctx);       // Draw the mamba
    });
}

function drawAnswerSquares() {
    answerSquares.forEach(square => {
        square.drawRect(ctx);
    });
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.drawRect(ctx);       // Draw the obstacle
    });
}

export function generateRandomSquarePosition(head) {
    while (true) {
        // Generate random positions aligned to the grid
        const x = BORDER_MARGIN + Math.floor(Math.random() * (
            (canvasWidth - 2 * BORDER_MARGIN) / BLOCK_SIZE)) * BLOCK_SIZE;
        const y = BORDER_MARGIN + Math.floor(Math.random() * (
            (canvasHeight - 2 * BORDER_MARGIN) / BLOCK_SIZE)) * BLOCK_SIZE;

        // Check for collisions with player or existing squares
        const isColliding = (square) =>
            x < square.x + BLOCK_SIZE &&
            x + BLOCK_SIZE > square.x &&
            y < square.y + BLOCK_SIZE &&
            y + BLOCK_SIZE > square.y;

        // Check if within a definded amount of blocks (Manhattan distance :) of the player's head
        const distanceToPlayer = Math.abs(x - head.x) / BLOCK_SIZE +
            Math.abs(y - head.y) / BLOCK_SIZE;

        if (!isColliding(head) &&
            !answerSquares.some(isColliding) &&
            (distanceToPlayer > 3)) {
            return { x, y };
        }
    }
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
        window.location.href = "../AllUsers/levelSelect1.html"; // Redirect to home
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
        // You can add logic here to continue playing the same level
    };

    // Add event listener for home button to go to the home screen
    homeButton.onclick = () => {
        window.location.href = "../AllUsers/levelSelect1.html"; // Redirect to home
        stopGame();
    };
}

// Score is multiplied by 10 for display
function updateScore() {
    scoreDisplay.textContent = 'Score: ' + score * MULTIPLIER;
}

// Redirect if not logged in
const userId = localStorage.getItem('user_id');
if (!userId) {
    alert("You must be logged in to access this page.");
    window.location.href = '/mathGoesRetro_frontend/AllUsers/index.html'; // Redirect to login page
}