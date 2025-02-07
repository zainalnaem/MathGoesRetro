import { 
    canvas, BLOCK_SIZE, canvasWidth, canvasHeight, 
    BORDER_MARGIN, scoreDisplay
} from './globals.js';
import { 
    initializeSquares, Square, squarePlayer, 
    createCorrectAnswerSquare, correctAnswerSquare,
    createWrongAnswersSquare, answerSquares, fetchTasks, 
    loadRandomTask, tasks, createObstacles, obstacles 
} from './squaresTraffic.js';
import { keyControl } from './keyControls.js';
import { gameOverSound, pointsSound } from './sound.js';
import { getColorByName } from './c64Colors.js';

const ctx = canvas.getContext("2d");

let isGameRunning = true;
let gameSpeed = 4; // Base speed
let car; // The player's car
let score = 0;

// Constants for lane-based movement
const LANE_WIDTH = canvasWidth / 3;
const lanes = [LANE_WIDTH / 2, LANE_WIDTH + LANE_WIDTH / 2, 2 * LANE_WIDTH + LANE_WIDTH / 2];

// Initialize controls
function setupControls() {
    keyControl(); // Enable arrow key or touch controls
    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft" && car.x > lanes[0]) {
            car.x = lanes[lanes.indexOf(car.x) - 1]; // Move left
        } else if (event.key === "ArrowRight" && car.x < lanes[2]) {
            car.x = lanes[lanes.indexOf(car.x) + 1]; // Move right
        }
    });
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

// Spawn new objects (correct answers and obstacles)
function spawnObjects() {
    const randomLane = Math.floor(Math.random() * 3);
    const spawnAnswer = Math.random() > 0.5; // 50% chance for correct answer

    if (spawnAnswer) {
        createCorrectAnswerSquare(lanes[randomLane], 0); // Create a correct answer
    } else {
        const obstacle = new Square(
            lanes[randomLane],
            0,
            BLOCK_SIZE,
            "", // No text
            getColorByName("Grey"), // Obstacle color
            "", // No text color
            false,
            false
        );
        obstacles.push(obstacle); // Add obstacle to the array
    }
}

// Update positions of objects
function updateObjects() {
    // Update obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.y += gameSpeed;
        if (obstacle.y > canvasHeight) obstacles.splice(index, 1); // Remove off-screen obstacles
    });

    // Update correct answers
    answerSquares.forEach((answer, index) => {
        answer.y += gameSpeed;
        if (answer.y > canvasHeight) answerSquares.splice(index, 1); // Remove off-screen answers
    });
}

// Draw game elements
function drawGameElements() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw lane separators
    ctx.strokeStyle = getColorByName("White");
    ctx.lineWidth = 2;
    for (let i = 1; i < 3; i++) {
        const x = i * LANE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }

    // Draw the car
    car.drawRect(ctx);

    // Draw obstacles
    obstacles.forEach((obstacle) => obstacle.drawRect(ctx));

    // Draw correct answers
    answerSquares.forEach((answer) => answer.drawRect(ctx));
}

// Check for collisions
function checkCollisions() {
    const carBounds = {
        left: car.x - BLOCK_SIZE / 2,
        right: car.x + BLOCK_SIZE / 2,
        top: car.y,
        bottom: car.y + BLOCK_SIZE
    };

    // Collision with obstacles
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
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
            return true; // Collision detected
        }
    }

    // Collision with correct answers
    for (let i = 0; i < answerSquares.length; i++) {
        const answer = answerSquares[i];
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
            answerSquares.splice(i, 1); // Remove collected answer
            score += 10; // Increase score
            pointsSound.play();
            updateScore();
        }
    }

    return false;
}

// Stop the game
function stopGame() {
    isGameRunning = false;
    gameOverSound.play();
    ctx.fillStyle = "white";
    ctx.font = "40px 'ComputerPixel'";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2);
}

// Main game loop
function gameLoop() {
    if (!isGameRunning) return;

    updateObjects();
    drawGameElements();

    if (checkCollisions()) {
        stopGame();
        return;
    }

    if (Math.random() < 0.02) spawnObjects(); // Randomly spawn objects
    requestAnimationFrame(gameLoop);
}

// Initialize the game
async function initializeGame() {
    await fetchTasks(); // Load tasks from the database
    loadRandomTask(); // Load the first task
    initializeSquares(); // Set up initial correct answers and obstacles
    createWrongAnswersSquare(); // Create initial wrong answers

    car = new Square(
        lanes[1], // Start in the middle lane
        canvasHeight - 60,
        BLOCK_SIZE,
        "", // No text
        getColorByName("Orange"), // Car color
        "", // No text color
        false,
        false
    );

    setupControls(); // Enable controls
    updateScore();
    gameLoop();
}

document.addEventListener("DOMContentLoaded", initializeGame);
