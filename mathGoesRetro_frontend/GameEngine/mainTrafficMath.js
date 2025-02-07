import { BLOCK_SIZE, BORDER_MARGIN } from './globals.js';
import {
    initializeSquaresArray, answerSquares, squarePlayerArrayCar,
    obstacles, fetchTasks, loadRandomTask, question, tasks, createAnswerSquaresTraffic
} from './squaresTraffic.js';
import { keyControl, currentDirection, isMoving } from './keyControlsTraffic.js';
import { gameOverSound, pointsSound } from './sound.js';
import { getColorByName } from './c64Colors.js';

const canvas = document.getElementById("canvasTrafficMath");
export const canvasWidth = canvas.width;
export const canvasHeight = canvas.height;
// Reference canvas = document.getElementById("canvas") takes place in globals.js
const ctx = canvas.getContext("2d");

const scoreDisplay = document.querySelector('.score');
const questionDisplay = document.querySelector('.question');

let lastFrameTime = 0;          // Timestamp of the last frame
const FRAME_DURATION = 150;     // Duration of a frame in milliseconds (150 ms = 6.67 frames per second)
let isGameRunning = true;       // Controls the game loop

let gameSpeed = 20; // Base speed

// Constants for lane-based movement
const LANE_WIDTH = canvasWidth / 3;
export const lanes = [LANE_WIDTH / 2, LANE_WIDTH + LANE_WIDTH / 2, 2 * LANE_WIDTH + LANE_WIDTH / 2];

let lastMoveTime = 0; // Zeitpunkt der letzten Bewegung
const MOVE_COOLDOWN = 150; // Millisekunden zwischen Bewegungen (Cooldown)

let car = [];

// Score increments by 1 for each correct answer, but multiplied by 10 for display
export let score = 0;
export let currentLevel = getSelectedLevel(); // Retrieve and store the current level
export let currentStage = 1;
export let counterCorrect = 0;
const MULTIPLIER = 10;

// !! Should be fetched from entity game later !!
// c for complex, d for derivative, r for radiant
export let mathTopic = "r";

// Function to retrieve the selected level from URL and log it to the console
function getSelectedLevel() {
    const urlParams = new URLSearchParams(window.location.search);
    const level = parseInt(urlParams.get("level"), 10); // Get level from URL as an integer
    console.log(`urlParams: ${urlParams}"`);
    console.log(`Selected Level: ${level}`);  // Log the retrieved level
    return isNaN(level) ? 1 : level; // Default to level 1 if not found or invalid
}

// Initialize the game
async function initializeGame() {
    currentStage = currentLevel;  // Explicitly set difficulty to match level at the start

    await fetchTasks();             // Load tasks from the database
    if (tasks.length === 0) {
        console.error("No tasks available.");
        return;
    }

    loadRandomTask();               // Load the first task

    // Initialize the player and squares square for correct answer and wrong answers
    initializeSquaresArray();
    car = squarePlayerArrayCar;
    setupControls();

    if (currentLevel === 1 || currentLevel === 4 || currentLevel === 7) {
        currentStage = 1; // Switch to Level 1
        counterCorrect = 0; // Reset counter
    } else if (currentLevel === 2 || currentLevel === 5 || currentLevel === 8) {
        currentStage = 2; // Switch to Level 2
        counterCorrect = 0; // Reset counter
    } else if (currentLevel === 3 || currentLevel === 6 || currentLevel === 9) {
        currentStage = 3; // Switch to Level 3
        counterCorrect = 0; // Reset counter
    }

    console.log("Traffic Math initialized.");
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

// Score is multiplied by 10 for display
function updateScore() {
    scoreDisplay.textContent = 'Score: ' + score * MULTIPLIER;
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
    console.log("Answer squares after entering gameLoop:", answerSquares);

    if (!lastFrameTime) lastFrameTime = timestamp;

    const deltaTime = timestamp - lastFrameTime;

    if (deltaTime >= FRAME_DURATION) {
        lastFrameTime = timestamp;

        clearCanvas();
        updateObjects();
        drawGameElements();
        movePlayer();
        checkCollisions();
    }

    if (isGameRunning) {
        requestAnimationFrame(gameLoop);
    }
    console.log("Hello from gameLoop:");

}

function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

// Check for collisions
function checkCollisions() {
    for (let i = 0; i < car.length; i++) {
        const carBounds = {
            left: car[i].x - BLOCK_SIZE / 2,
            right: car[i].x + BLOCK_SIZE / 2,
            top: car[i].y,
            bottom: car[i].y + BLOCK_SIZE
        };

        // Prüfen auf Kollision mit Hindernissen
        for (let j = 0; j < obstacles.length; j++) {
            const obstacle = obstacles[j];
            const obstacleBounds = {
                left: obstacle.x - BLOCK_SIZE / 2,
                right: obstacle.x + BLOCK_SIZE / 2,
                top: obstacle.y,
                bottom: obstacle.y + BLOCK_SIZE
            };

            if (
                carBounds.left < obstacleBounds.right &&
                carBounds.right > obstacleBounds.left &&
                carBounds.top < obstacleBounds.bottom &&
                carBounds.bottom > obstacleBounds.top
            ) {
                return true; // Kollision mit Hindernis erkannt
            }
        }

        // Prüfen auf Kollision mit Antwortquadraten
        for (let k = 0; k < answerSquares.length; k++) {
            const answer = answerSquares[k];
            const answerBounds = {
                left: answer.x - BLOCK_SIZE / 2,
                right: answer.x + BLOCK_SIZE / 2,
                top: answer.y,
                bottom: answer.y + BLOCK_SIZE
            };

            if (
                carBounds.left < answerBounds.right &&
                carBounds.right > answerBounds.left &&
                carBounds.top < answerBounds.bottom &&
                carBounds.bottom > answerBounds.top
            ) {
                if (answer.isCorrectAnswer) {
                    answerSquares.splice(k, 1); // Entferne das richtige Antwort Quadrat
                    score++; // Erhöhe den Score
                    pointsSound.play(); // Spiele den Sound ab
                    updateScore(); // Aktualisiere den Score

                    // Lade eine neue Frage und Antworten
                    loadRandomTask();
                    

                    return true; // Kollision mit richtigem Antwort Quadrat erkannt
                } else if (answer.isWrongAnswer) {
                    stopGame(); // Spiel stoppen bei falscher Antwort
                    return true; // Kollision mit falschem Antwort Quadrat erkannt
                }
            }
        }
    }

    return false; // Keine Kollision erkannt
}


function stopGame() {
    isGameRunning = false;       // Stop the game loop
    showGameOverMessage();       // Show "GAME OVER" message
    gameOverSound.play();        // Play the Game Over sound

    // Update stats on game over
    updateGameStats(score, counterCorrect, currentLevel, counterCorrect);
}

function showGameOverMessage() {
    ctx.save();
    ctx.globalAlpha = 1.0;                          // Fully opaque
    ctx.fillStyle = getColorByName('Lavender');                          // Red color for the message
    ctx.font = "60px 'ComputerPixel";               // Font size and style
    ctx.textAlign = "center";                       // Align text in the center
    ctx.textBaseline = "middle";                    // Vertical alignment
    ctx.shadowColor = getColorByName('Lavender');
    ctx.shadowBlur = 20;                            // Blurring for glow effect
    ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2); // Display the message
    ctx.restore();
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

// Move player square based on direction

function movePlayer() {
    // Wenn keine Bewegung stattfindet, nichts tun
    if (!isMoving) return;

    // Wenn die Richtung "links" ist und das Auto nicht in der ersten Lane ist
    if (currentDirection === "LEFT" && car[0].x > lanes[0]) {
        car.forEach((square) => {
            square.x = lanes[lanes.indexOf(square.x) - 1];
        });
    }

    // Wenn die Richtung "rechts" ist und das Auto nicht in der letzten Lane ist
    else if (currentDirection === "RIGHT" && car[0].x < lanes[2]) {
        car.forEach((square) => {
            square.x = lanes[lanes.indexOf(square.x) + 1];
        });
    }

    isMoving = false; // Bewegung nach der Ausführung stoppen
}


function drawGameElements() {
    console.log("ansSq at the beginning of drawGameEl: ", answerSquares);

    drawLanes();
    drawCar();
    drawAnswerSquares();

    console.log("ansSq at the end of drawGameEl: ", answerSquares);


}

// Draw lane separators
function drawLanes() {
    ctx.strokeStyle = getColorByName("White");
    ctx.lineWidth = 2;
    for (let i = 1; i < 3; i++) {
        const x = i * LANE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }
}

function drawCar() {
    car.forEach(segment => {
        segment.drawRect(ctx);
    });
}

// Zeichne alle Antwortquadrate
function drawAnswerSquares() {
    answerSquares.forEach(square => {
        square.drawRect(ctx); // Draw each answer square
    });
}

// Update positions of objects
function updateObjects() {
    console.log("answersquares before reaching end: ", answerSquares);
    // Update correct answers
    answerSquares.forEach((answer, index) => {
        answer.y += gameSpeed;
        if (answer.y > canvasHeight) {
            //answerSquares.splice(index, 1); // Remove off-screen answers
            console.log("answersquares after reaching end: ", answerSquares);
        }
    });
}

// Start game not before DOM has been completely loaded
document.addEventListener("DOMContentLoaded", async () => {
    await initializeGame();
    console.log("Answer squares after initialization, but before gameLoop:", answerSquares);
    if (answerSquares.length === 0) {
        console.error("No answer squares were created.");
    }
    requestAnimationFrame(gameLoop);
});