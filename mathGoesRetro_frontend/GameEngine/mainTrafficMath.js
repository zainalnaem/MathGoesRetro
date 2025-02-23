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
    fetchTasks,
    tasks,
    loadRandomTask,
    createPlayerSquareArrayCar,
    squarePlayerArrayCar,
    answerSquares,
    correctAnswerSquare,
    createAnswerSquares,
} from "./squaresTraffic.js";

import { keyControl, touchControl } from "./keyControlsTraffic.js";
import { getColorByName } from "./c64Colors.js";
import { pointsTrafficSound, collisionTrafficSound, motorRunningSound } from "./sound.js";
import { BLOCK_SIZE } from "./globals.js";

const canvas = document.getElementById("canvasTrafficMath");
export const canvasWidth = canvas.width;
export const canvasHeight = canvas.height;
const scoreDisplay = document.querySelector(".score");

const ctx = canvas.getContext("2d");

let lastFrameTime = 0;
// Duration of a frame in milliseconds
let FRAME_DURATION = 200;
let baseFrameDuration = FRAME_DURATION; 
let SPEED_MULTIPLIER = 0.75;

// How many pixels the falling squares move each frame
const MOVEMENT_STEPS = BLOCK_SIZE / 2;

let isGameRunning = true;
let hit = false; // Flag to check if the car has hit a correct answer
let animationFrameId;

const LANE_WIDTH = canvasWidth / 3;
export const lanes = [
    Math.round(LANE_WIDTH / 2),
    Math.round(LANE_WIDTH + LANE_WIDTH / 2),
    Math.round(2 * LANE_WIDTH + LANE_WIDTH / 2),
];

// For rendering moving lane separators
let laneOffset = 0;
const LANE_SPEED = 5;

export let car = []; // Will be assigned from squarePlayerArrayCar

// Scoring
export let score = 0;
const MULTIPLIER = 10;
export let currentLevel = getSelectedLevel();
const AMOUNT_OF_STAGES = 3;
export let currentStage = currentLevel % AMOUNT_OF_STAGES;
const CORRECT_ANSWERS_TO_UNLOCK_NEXT_LEVEL = 5;
export let counterCorrect = 0;

// Example: c for complex, d for derivative, r for radiant
export let mathTopic = "r";

function getSelectedLevel() {
    const urlParams = new URLSearchParams(window.location.search);
    const level = parseInt(urlParams.get("level"), 10);
    return isNaN(level) ? 1 : level; 
}

// Start the game once DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
    await initializeGame();
    requestAnimationFrame(gameLoop);
});

// 1) Initialize the game
async function initializeGame() {
    await fetchTasks();
    if (tasks.length === 0) {
        console.error("No tasks available.");
        return;
    }

    createPlayerSquareArrayCar(); // Puts the car in the middle lane
    car = squarePlayerArrayCar;   // Our exported `car` references the same array

    loadRandomTask();   
    createAnswerSquares();
    counterCorrect = 0; 

    // We already import keyControl() and touchControl() from keyControlsTraffic.js
    // so we do NOT add another 'keydown' listener here. We let keyControls handle it.

    // Start the motor sound only once user clicks
    document.addEventListener(
        "click",
        () => {
            motorRunningSound.play();
        },
        { once: true }
    );
    motorRunningSound.audio.loop = true;
}

// 2) The main game loop
function gameLoop(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;
    const deltaTime = timestamp - lastFrameTime;

    // Faster speed in stage=0
    if (currentStage === 0) {
        FRAME_DURATION = baseFrameDuration * SPEED_MULTIPLIER;
    } else {
        FRAME_DURATION = baseFrameDuration;
    }

    if (deltaTime >= FRAME_DURATION) {
        lastFrameTime = timestamp;
        clearCanvas();

        // Check collisions with squares for a wrong answer
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
                showLevelUpPopup();
            }
            updateScore();
            pointsTrafficSound.play();
            correctAnswerSquare.text = ""; 
        }

        drawGameElements();
    }

    if (isGameRunning) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

// 3) Movement & collisions
function checkCollisionsTraffic() {
    return collisionWithWrongAnswerSquareTraffic();
}

function collisionWithWrongAnswerSquareTraffic() {
    return car.some((carSegment) =>
        answerSquares.some(
            (square) =>
                square.isWrongAnswer &&
                square.x === carSegment.x &&
                square.y === carSegment.y
        )
    );
}

function collisionWithCorrectAnswerSquareTraffic(car) {
    return car.some(
        (carSegment) =>
            carSegment.x === correctAnswerSquare.x && carSegment.y === correctAnswerSquare.y
    );
}

function stopGame() {
    isGameRunning = false;
    showGameOverPopup();
    motorRunningSound.audio.pause();
    collisionTrafficSound.play();

    // Update stats on game over
    updateGameStats(score, counterCorrect, currentLevel, counterCorrect);
}

async function updateGameStats(score, correctAnswers, currentLevel, counterCorrect) {
    const userId = localStorage.getItem("user_id");
    const gameId = 3; // or dynamic if needed

    if (!userId || !gameId) {
        console.error("Missing userId or gameId");
        return;
    }

    try {
        await fetch(`http://localhost:3000/api/gameStats/user/${userId}/game/${gameId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                new_highscore: score * MULTIPLIER,
                new_correct_answers: correctAnswers,
                currentLevel: currentLevel,
                counterCorrect: counterCorrect,
            }),
        });
    } catch (error) {
        console.error("Error updating game stats:", error);
    }
}

// 4) The falling answers
function moveAnswerSquares() {
    for (let i = answerSquares.length - 1; i >= 0; i--) {
        answerSquares[i].y += MOVEMENT_STEPS;

        if (answerSquares[i].y > canvasHeight) {
            answerSquares.splice(i, 1);

            // Slight delay to avoid issues with immediate removal
            setTimeout(() => {
                loadRandomTask();
                createAnswerSquares();
                hit = false;
            }, 50);
        }
    }
}

// 5) Rendering
function drawGameElements() {
    drawLanes();
    drawCar();
    drawAnswerSquares();
}

function drawLanes() {
    ctx.strokeStyle = getColorByName("LightGrey");
    ctx.lineWidth = 6;
    ctx.setLineDash([35, 60]); // dash, gap

    for (let i = 1; i < 3; i++) {
        const x = i * LANE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, -60 + laneOffset);
        ctx.lineTo(x, canvasHeight + laneOffset);
        ctx.stroke();
    }

    laneOffset += LANE_SPEED;
    // Reset lane offset to avoid overflow
    if (laneOffset >= 60 + 35) {
        laneOffset = 0;
    }
}

function drawCar() {
    car.forEach((segment) => {
        segment.drawRect(ctx);
    });
}

function drawAnswerSquares() {
    answerSquares.forEach((square, index) => {
        square.drawRect(ctx);

        // Create an HTML element for rendering KaTeX
        let katexContainer = document.getElementById(`answer-${index}`);
        if (!katexContainer) {
            katexContainer = document.createElement("div");
            katexContainer.id = `answer-${index}`;
            katexContainer.style.position = "absolute";
            katexContainer.style.color = "white";
            katexContainer.style.fontSize = "20px";
            katexContainer.style.textAlign = "center";
            katexContainer.style.pointerEvents = "none";
            document.body.appendChild(katexContainer);
        }
        // Remove KaTeX if the square is off-screen
        if (square.y > canvasHeight) {
            katexContainer.remove();
            return;
        }

        // Position the container above the corresponding square
        const maxX = canvas.offsetLeft + canvas.width - katexContainer.offsetWidth;
        const maxY = canvas.offsetTop + canvas.height - katexContainer.offsetHeight;

        katexContainer.style.left = `${Math.min(canvas.offsetLeft + square.x, maxX)}px`;
        katexContainer.style.top = `${Math.min(canvas.offsetTop + square.y, maxY)}px`;

        katex.render(square.text, katexContainer);
    });
}

// 6) Popups
function showGameOverPopup() {
    const gameOverPopup = document.getElementById("gameOverPopup");
    const restartButton = document.getElementById("restartButton");
    const homeButton = document.getElementById("homeButton");

    gameOverPopup.classList.remove("hidden");

    restartButton.onclick = () => {
        location.reload();
    };
    homeButton.onclick = () => {
        window.location.href = "../AllUsers/levelSelect3.html";
    };
}

function showLevelUpPopup() {
    const levelUpPopup = document.getElementById("levelUpPopup");
    const continueButton = document.getElementById("continueButton");
    const homeButton = document.getElementById("homeButton1");

    levelUpPopup.classList.remove("hidden");
    isGameRunning = false;
    cancelAnimationFrame(animationFrameId);

    continueButton.onclick = () => {
        levelUpPopup.classList.add("hidden");
        isGameRunning = true;
        requestAnimationFrame(gameLoop);

        lastFrameTime = performance.now();
        gameLoop(lastFrameTime);
    };

    homeButton.onclick = () => {
        window.location.href = "../AllUsers/levelSelect3.html";
        stopGame();
    };
}

function updateScore() {
    scoreDisplay.textContent = "Score: " + score * MULTIPLIER;
}

// 7) If user is not logged in, redirect
const userId = localStorage.getItem("user_id");
if (!userId) {
    alert("You must be logged in to access this page.");
    window.location.href = "/mathGoesRetro_frontend/AllUsers/index.html";
}
