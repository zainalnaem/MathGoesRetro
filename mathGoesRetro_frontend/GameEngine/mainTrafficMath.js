/**
 * Name: MathGoesRetro
 * Author: Paul Schöpfer
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles the core logic for the Traffic Math game, including game initialization, 
 * the main loop, player controls, collision detection, scoring, and level progression.
 */

import {
    fetchTasks, tasks, loadRandomTask, createPlayerSquareArrayCar,
    squarePlayerArrayCar, answerSquares, correctAnswerSquare,
    createAnswerSquares
} from "./squaresTraffic.js";
import { keyControl } from "./keyControlsTraffic.js";
import { getColorByName } from './c64Colors.js';
import { pointsTrafficSound, collisionTrafficSound, motorRunningSound } from './sound.js';
import { BLOCK_SIZE } from './globals.js';

const canvas = document.getElementById("canvasTrafficMath");
export const canvasWidth = canvas.width;
export const canvasHeight = canvas.height;
const scoreDisplay = document.querySelector('.score');

const ctx = canvas.getContext("2d");

let lastFrameTime = 0;          // Timestamp of the last frame
// Duration of a frame in milliseconds (150 ms = 6.67 frames per second)
let FRAME_DURATION = 200;
let baseFrameDuration = FRAME_DURATION; // Saves the base speed
let SPEED_MULTIPLIER = 0.75;
// Defines steps in movement of answers
const MOVEMENT_STEPS = BLOCK_SIZE / 2;
let isGameRunning = true;       // Controls the game loop
// Flag to check if the car has hit a correct answer
let hit = false;
let animationFrameId;

const LANE_WIDTH = canvasWidth / 3;
export const lanes = [
    Math.round(LANE_WIDTH / 2),
    Math.round(LANE_WIDTH + LANE_WIDTH / 2),
    Math.round(2 * LANE_WIDTH + LANE_WIDTH / 2)
];
let laneOffset = 0; // Offset for lane separators
const LANE_SPEED = 5; // Vertical speed of lane separators
export let car = [];

// Score increments by 1 for each correct answer, but multiplied by 10 for display
export let score = 0;
export let currentLevel = getSelectedLevel(); // Retrieve and store the current level
const AMOUNT_OF_STAGES = 3;
export let currentStage = currentLevel % AMOUNT_OF_STAGES;
const CORRECT_ANSWERS_TO_UNLOCK_NEXT_LEVEL = 5;
export let counterCorrect = 0;
const MULTIPLIER = 10;

// !! Should be fetched from entity game later !!
// c for complex, d for derivative, r for radiant
export let mathTopic = "r";

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

    await fetchTasks();             // Load tasks from the database
    if (tasks.length === 0) {
        console.error("No tasks available.");
        return;
    }

    createPlayerSquareArrayCar();  // Add the player to the squares array
    car = squarePlayerArrayCar;

    loadRandomTask();               // Load the first task
    createAnswerSquares();

    counterCorrect = 0; // Reset counter

    setupControls();

    // Play the motor sound when the game starts
    document.addEventListener("click", () => {
        motorRunningSound.play();
    }, { once: true }); // Only play once 

    motorRunningSound.audio.loop = true; // Enable looping for the motor sound
}

// Main game loop
function gameLoop(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;

    const deltaTime = timestamp - lastFrameTime;

    // If the game is in stage 3 (=0), increase the speed
    if (currentStage === 0) {
        FRAME_DURATION = baseFrameDuration * SPEED_MULTIPLIER; // faster speed in stage 0
    } else {
        FRAME_DURATION = baseFrameDuration; // Normal speed
    }


    if (deltaTime >= FRAME_DURATION) {
        lastFrameTime = timestamp;

        clearCanvas();

        // Check collisions with square for wrong answer (Game Over)
        if (checkCollisionsTraffic()) {
            stopGame();
            isGameRunning = false;
        }

        moveAnswerSquares();

        if (collisionWithCorrectAnswerSquareTraffic(car) && !hit) {
            hit = true;

            score++;
            counterCorrect++;
            if (counterCorrect === CORRECT_ANSWERS_TO_UNLOCK_NEXT_LEVEL) {
                showLevelUpPopup(); // Show the level up popup after [constant] correct answers
            }
            updateScore();
            console.log(pointsTrafficSound.volume); // Between 0 and 1
            pointsTrafficSound.play();
            correctAnswerSquare.text = ""; // Remove text from correct answer square
        }

        drawGameElements();
    }

    if (isGameRunning) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}


// Initialize controls
function setupControls() {
    keyControl(); // Enable arrow key or touch controls
    document.addEventListener("keydown", (event) => {
        // Check direction and move the car accordingly
        if (event.key === "ArrowLeft" && car[0].x > lanes[0]) {
            // Move each square of the car left
            car.forEach((square) => {
                square.x = lanes[lanes.indexOf(square.x) - 1]; // Move left
            });
        } else if (event.key === "ArrowRight" && car[0].x < lanes[2]) {
            // Move each square of the car right
            car.forEach((square) => {
                square.x = lanes[lanes.indexOf(square.x) + 1]; // Move right
            });
        }
    });
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function checkCollisionsTraffic() {
    return (collisionWithWrongAnswerSquareTraffic());
}

// Validate, if head crashes with square for wrong answer
function collisionWithWrongAnswerSquareTraffic() {
    return car.some(carSegment =>
        answerSquares.some(
            square => square.isWrongAnswer &&
                square.x === carSegment.x && square.y === carSegment.y
        )
    );
}

// Check if car collides with square for wrong or correct answers
function collisionWithCorrectAnswerSquareTraffic(car) {
    return car.some(carSegment =>
        carSegment.x === correctAnswerSquare.x && carSegment.y === correctAnswerSquare.y
    );
}

function stopGame() {
    isGameRunning = false;       // Stop the game loop
    showGameOverPopup();        // Show "GAME OVER" message
    motorRunningSound.audio.pause(); // Stop the motor sound
    collisionTrafficSound.play();        // Play the Game Over sound

    // Update stats on game over
    updateGameStats(score, counterCorrect, currentLevel, counterCorrect);
}

async function updateGameStats(score, correctAnswers, currentLevel, counterCorrect) {
    const userId = localStorage.getItem("user_id");
    const gameId = 3; // Replace with dynamic gameId if necessary

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

// Update positions of objects
function moveAnswerSquares() {
    for (let i = answerSquares.length - 1; i >= 0; i--) {
        answerSquares[i].y += MOVEMENT_STEPS;

        if (answerSquares[i].y > canvasHeight) {
            answerSquares.splice(i, 1); // Remove only one at a time

            // Timeout to avoid immediate removal of the correct answer square
            setTimeout(() => {
                loadRandomTask();
                createAnswerSquares();
                hit = false; // Reset hit
            }, 50); // 50ms delay
        }
    }
}

function drawGameElements() {
    drawLanes();
    drawCar();
    drawAnswerSquares();
}

// Draw lane separators
function drawLanes() {
    ctx.strokeStyle = getColorByName("LightGrey");
    ctx.lineWidth = 6;
    ctx.setLineDash([35, 60]);  // Set line dash pattern

    for (let i = 1; i < 3; i++) {
        const x = i * LANE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, -60 + laneOffset);
        ctx.lineTo(x, canvasHeight + laneOffset);
        ctx.stroke();
    }

    // Animate lane separators
    laneOffset += LANE_SPEED;

    // Reset lane offset to avoid overflow
    if (laneOffset >= 60 + 35) { // 60 (gap) + 35 (length of dash)
        laneOffset = 0;
    }
}

function drawCar() {
    car.forEach(segment => {
        segment.drawRect(ctx);
    });
}

// Draw the answer squares and render the mathematical expressions
function drawAnswerSquares() {
    answerSquares.forEach((square, index) => {
        square.drawRect(ctx); // Draw the rectangle

        // Create an HTML element for rendering KaTeX
        let katexContainer = document.getElementById(`answer-${index}`);
        if (!katexContainer) {
            katexContainer = document.createElement("div");
            katexContainer.id = `answer-${index}`;
            katexContainer.style.position = "absolute";
            katexContainer.style.color = "white"; // Match game text color
            katexContainer.style.fontSize = "20px"; // Adjust font size
            katexContainer.style.textAlign = "center";
            katexContainer.style.pointerEvents = "none"; // Avoid blocking interactions
            document.body.appendChild(katexContainer);
        }
        // If the square is outside the canvas, remove its corresponding KaTeX container
        if (square.y > canvasHeight) {
            katexContainer.remove(); // Remove the element from the DOM
            return; // Skip further processing for this square
        }

        // Position the container above the corresponding square
        const maxX = canvas.offsetLeft + canvas.width - katexContainer.offsetWidth;
        const maxY = canvas.offsetTop + canvas.height - katexContainer.offsetHeight;

        katexContainer.style.left = `${Math.min(canvas.offsetLeft + square.x, maxX)}px`;
        katexContainer.style.top = `${Math.min(canvas.offsetTop + square.y, maxY)}px`;

        // Render the mathematical expression in KaTeX
        katex.render(square.text, katexContainer);
    });
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
        window.location.href = "../AllUsers/levelSelect3.html"; // Redirect to home
    };
}

function showLevelUpPopup() {
    const levelUpPopup = document.getElementById("levelUpPopup");
    const continueButton = document.getElementById("continueButton");
    const homeButton = document.getElementById("homeButton1");

    // Show the popup
    levelUpPopup.classList.remove("hidden");
    isGameRunning = false; // Stop the game loop

    // Stop the animation loop properly
    cancelAnimationFrame(animationFrameId);

    // Add event listener for continue button to allow playing the same level
    continueButton.onclick = () => {
        levelUpPopup.classList.add("hidden"); // Hide the popup
        isGameRunning = true; // Resume the game loop
        requestAnimationFrame(gameLoop);

        // Ensure the game loop properly continues
        lastFrameTime = performance.now(); // Reset time tracking
        gameLoop(lastFrameTime); // Restart the loop
    };

    // Add event listener for home button to go to the home screen
    homeButton.onclick = () => {
        window.location.href = "../AllUsers/levelSelect3.html"; // Redirect to home
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