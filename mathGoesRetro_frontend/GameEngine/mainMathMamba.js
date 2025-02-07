import { BLOCK_SIZE, BORDER_MARGIN } from './globals.js';
import { 
    initializeSquaresArray, Square, answerSquares, squarePlayerArray, 
    createCorrectAnswerSquare, correctAnswerSquare, obstacles,
    createWrongAnswersSquare, fetchTasks, loadRandomTask, question, tasks,
    createObstacles
} from './squaresMamba.js';
import { keyControl } from './keyControls.js';
import { gameOverSound, pointsSound } from './sound.js';
import { getColorByName } from './c64Colors.js';

const canvas = document.getElementById("canvasMathMamba");
export const canvasWidth = canvas.width;
export const canvasHeight = canvas.height;
const scoreDisplay = document.querySelector('.score');
const questionDisplay = document.querySelector('.question');

// Reference canvas = document.getElementById("canvas") takes place in globals.js
const ctx = canvas.getContext("2d");

let lastFrameTime = 0;          // Timestamp of the last frame
const FRAME_DURATION = 150;     // Duration of a frame in milliseconds (150 ms = 6.67 frames per second)
let isGameRunning = true;       // Controls the game loop

let mamba;

// Score increments by 1 for each correct answer, but multiplied by 10 for display
export let score = 0;
export let currentLevel = getSelectedLevel(); // Retrieve and store the current level
export let currentStage = 1;
export let counterCorrect = 0;
const MULTIPLIER = 10;

// !! Should be feched from entity game later !!
// c for complex, d for derivative, r for radiant
export let mathTopic = "c";


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

    await fetchTasks();
    if (tasks.length === 0) {
        console.error("No tasks available.");
        return;
    }

    loadRandomTask();

    // Clear existing answer squares and obstacles
    answerSquares.splice(0, answerSquares.length);  // Clear any lingering answers
    obstacles.splice(0, obstacles.length);  // Clear old obstacles if any

    // Initialize the player and squares square for correct answer and wrong answers
    initializeSquaresArray();
    mamba = squarePlayerArray;

    if (currentLevel === 1 || currentLevel === 4 || currentLevel === 7) {
        currentStage = 1; // Switch to Level 1
        counterCorrect = 0; // Reset counter
    } else if (currentLevel === 2 || currentLevel === 5 || currentLevel === 8) {
        currentStage = 2; // Switch to Level 2
        counterCorrect = 0; // Reset counter
    } else if (currentLevel === 3 || currentLevel === 6 || currentLevel === 9) {
        currentStage = 3; // Switch to Level 3
        counterCorrect = 0; // Reset counter
        obstacles.splice(0, obstacles.length);
        createObstacles();  // Create obstacles
    }
    
    keyControl();        // Enable controls (keyboard or touch)
    updateScore();       // Show score from the beginning
    updateQuestion();    // Show question from the beginning

    console.log("Math Mamba initialized.");
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

        movePlayer();                                       // Move the player (snake)
        drawGameElements();                                 // Draw all game elements
    }

    if (isGameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function checkCollisions() {
    const head = mamba[0];
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

function stopGame() {
    isGameRunning = false;       // Stop the game loop
    showGameOverPopup();        // Show "GAME OVER" message
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

// function showGameOverMessage() {
//     ctx.save();
//     ctx.globalAlpha = 1.0;                          // Fully opaque
//     ctx.fillStyle = getColorByName('Lavender');                          // Red color for the message
//     ctx.font = "60px 'ComputerPixel";               // Font size and style
//     ctx.textAlign = "center";                       // Align text in the center
//     ctx.textBaseline = "middle";                    // Vertical alignment
//     ctx.shadowColor = getColorByName('Lavender');
//     ctx.shadowBlur = 20;                            // Blurring for glow effect
//     ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2); // Display the message
//     ctx.restore();
// }

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
    const head = { 
        x: mamba[0].x, 
        y: mamba[0].y 
    };

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

    // Remove last segment of mamba, if no square for correct answer was eaten
    // This simulates a movement of the mamba
    if (!checkCorrectAnswerSquareCollision(head)) {
        mamba.pop(); // Remove last segment
    }
}

function drawGameElements() {
    
    mamba.forEach((segment, index) => {
        // Color for body of mamba
        if (index !== 0) {
            ctx.fillStyle = getColorByName('Orange');
        } else {
            ctx.fillStyle = segment.fillColorSq || "rgba(0, 0, 0, 0)";
        }
        segment.drawRect(ctx);
    });
    
    drawCorrectAnswerSquare();          // Draw the square for correct answer 
    drawWrongAnswerSquares();           // Draw all squares for wrong answers
    if (currentStage === 3) {
        drawObstacles();                    // Draw all obstacles
    }
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

function drawObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.drawRect(ctx);       // Draw the obstacle
    });
}

export function generateRandomSquarePosition(squarePlayer) {
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
         const distanceToPlayer = Math.abs(x - squarePlayer.x) / BLOCK_SIZE +
         Math.abs(y - squarePlayer.y) / BLOCK_SIZE;

        if (!isColliding(squarePlayer) && 
            !answerSquares.some(isColliding) && 
            (distanceToPlayer > 3)) {
            return { x, y };
        }
    }
}

// Check if the snake collides with square for correct answer - or walls or enemies
function checkCorrectAnswerSquareCollision(head) {
    if (head.x === correctAnswerSquare.x && head.y === correctAnswerSquare.y) {
        if (correctAnswerSquare.isCorrectAnswer) {
            score++;
            if (score === 3) {
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
            createCorrectAnswerSquare();

            // Create new squares for wrong answers at random positions
            createWrongAnswersSquare();

            return true;    // Square for correct answer was eaten
        }
        
        // If the head collides with an square for wrong answers, it doesn't grow or score
        return false;       // Square for correct answer was not eaten
    }
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