/**
 * Name: MathGoesRetro
 * Author: Paul Schöpfer
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles game logic for Math Mamba, including task management, 
 * generating answer squares, obstacles, and rendering game elements.
 */

import { BORDER_MARGIN, BLOCK_SIZE } from './globals.js';
import { getColorByName } from './c64Colors.js';
import {
    canvasWidth, canvasHeight, currentStage, generateRandomSquarePosition,
    currentLevel
} from './mainMathMamba.js';


export const answerSquares = [];    // 1 Correct and 3 wrong answers
export let squarePlayerArray = [];       // Will be used for player's body later, e.g. the mamba
export let correctAnswerSquare;     // This will hold the current square for correct answer

export const obstacles = [];           // Will be used for obstacles later
const AMOUNT_OBSTACLES = 8;                // Amount of obstacles for Level 3
const MIN_DIST_BORDER = 2;              // Minimum distance from the border for obstacles

// Simulate task fetching and randomization
export let tasks = []; // List of tasks fetched from server or predefined
let currentTask = null;
export let question = "";
let correctAnswer = "";
let wrongAnswer1 = "";
let wrongAnswer2 = "";
let wrongAnswer3 = "";

import { mathTopic } from './mainMathMamba.js';

export async function fetchTasks() {
    try {
        const response = await fetch('http://localhost:3000/api/tasks');
        tasks = await response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Load random task
export function loadRandomTask() {
    if (tasks.length > 0) {
        // Determine the difficulty level based on the currentLevel
        let difficultyLevel;
        if (currentLevel >= 1 && currentLevel <= 3) {
            difficultyLevel = 1;
        } else if (currentLevel >= 4 && currentLevel <= 6) {
            difficultyLevel = 2;
        } else if (currentLevel >= 7 && currentLevel <= 9) {
            difficultyLevel = 3;
        }

        // Filters all tasks by topic and difficulty level
        const filteredTasks = tasks.filter(
            task => task.topic === mathTopic && task.status === 'a' && task.difficulty === difficultyLevel
        );

        if (filteredTasks.length > 0) {
            // Pick a random task out of filtered ones
            const randomTask = filteredTasks[Math.floor(Math.random() * filteredTasks.length)];
            currentTask = randomTask;
            renderQuestion();
            renderAnswers();
        } else {
            console.warn(`No tasks for topic "${mathTopic}" and difficulty "${difficultyLevel}" found.`);
            currentTask = null; // Set currentTask to null if no task is found
        }
    } else {
        console.error("No task available.");
    }
}


// Dynamically render the question at the top of the page
function renderQuestion() {
    const questionDiv = document.querySelector('.question'); // Chooses element containing class "question"
    if (questionDiv && currentTask) {
        question = currentTask.question; // Save question in global variable "question"
        questionDiv.innerHTML = '';      // Clear existing element of question

        // Render question with KaTeX
        katex.render(question, questionDiv, {
            throwOnError: false, // Ignore errors to prevent system crash
        });
    } else {
        console.error('Question element not found or currentTask is undefined.');
    }
}

// Dynamically render the answers 
function renderAnswers() {
    correctAnswer = currentTask.correct_answer;
    wrongAnswer1 = currentTask.wrong_answer1;
    wrongAnswer2 = currentTask.wrong_answer2;
    wrongAnswer3 = currentTask.wrong_answer3;
}

// Initialize player's square (snake's head)
export function createPlayerSquareArray() {
    squarePlayerArray = [
        new Square(
            BORDER_MARGIN,
            BORDER_MARGIN,
            BLOCK_SIZE,
            "",
            getColorByName('Green'),
            "",
            false,
            false,
            null,
            ""
        )
    ];
}

export function createAnswerSquares() {
    createCorrectAnswerSquare();
    createWrongAnswersSquare();
}

// Create a new square for correct answer at a random position
function createCorrectAnswerSquare() {
    const { x, y } = generateValidPosition();

    // Create new square for correct answer
    correctAnswerSquare = new Square(
        x,
        y,
        BLOCK_SIZE,
        correctAnswer,      // Text
        "",                 // Color of square
        getColorByName('Plum'), // Color of text
        true,               // True: Marking it as a correct answer
        false,              // False: Marking it as a wrong answer
        null,               // No image
        ""                  // 🍓
    );

    answerSquares.push(correctAnswerSquare);
}

export function createWrongAnswersSquare() {
    let wrongAnswers = [];

    switch (currentStage) {
        case 1:
            wrongAnswers = [wrongAnswer1]; // Array with one wrong answer
            break;
        case 2:
        case 3:
            wrongAnswers = [wrongAnswer1, wrongAnswer2, wrongAnswer3]; // Array of 3 wrong answers
            break;
        default:
            wrongAnswers = [];
    }

    wrongAnswers.forEach((wrongAnswer) => {
        const { x, y } = generateValidPosition();

        // Create new square for wrong answer
        const wrongAnswerSquare = new Square(
            x,
            y,
            BLOCK_SIZE,
            wrongAnswer,    // Text
            "",             // Color of square
            getColorByName('Plum'), // Color of text
            false,          // False: Marking it as a correct answer 
            true,           // True: Marking it as a wrong answer
            null,           // No image
            ""              // 🍓
        );

        // Add square of wrong answer to the squares array
        answerSquares.push(wrongAnswerSquare);
    });
}

export function createObstacles() {
    // Create obstacles for Level 3
    for (let i = 0; i < AMOUNT_OBSTACLES; i++) {   // Create 4 obstacles
        const { x, y } = generateValidPosition();

        // Create new square for obstacle
        const obstacle = new Square(
            x,
            y,
            BLOCK_SIZE,
            "",             // Text
            getColorByName('Grey'), // Color of square
            "",             // Color of text
            false,          // False: Marking it as a correct answer 
            false,          // False: Marking it as a wrong answer
            null,           // No image
            ""              // 🍓
        );

        // Add square of obstacle to the squares array
        obstacles.push(obstacle);
    }

}

function generateValidPosition(isObstacle = false) {
    let positionValid = false;
    let x, y;

    while (!positionValid) {
        // Generate random position within the playable area, avoiding BORDER_MARGIN
        ({ x, y } = generateRandomSquarePosition(squarePlayerArray[0])); // Not on player's square

        // Define the minimum distance from the border for obstacles
        const minDistanceFromBorder = isObstacle
            ? BORDER_MARGIN + (BLOCK_SIZE * MIN_DIST_BORDER) // Obstacles must be at least x squares from the border
            : BORDER_MARGIN; // Default for other squares

        // Ensure the position is inside the inner playable area (not in the BORDER_MARGIN)
        const withinPlayableArea = (
            x >= minDistanceFromBorder &&
            y >= minDistanceFromBorder &&
            x < canvasWidth - minDistanceFromBorder &&
            y < canvasHeight - minDistanceFromBorder
        );

        // Ensure the position doesn't collide with the player's snake
        const noCollisionWithSnake = !squarePlayerArray.some(segment => segment.x === x && segment.y === y);
        // Ensure the position doesn't collide with other answer squares
        const noCollisionWithSquare = !answerSquares.some(square => square.x === x && square.y === y);
        // Ensure the position doesn't collide with obstacles
        const noCollisionWithObstacle = !obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);

        // Validate position
        positionValid = withinPlayableArea && noCollisionWithSnake && noCollisionWithSquare && noCollisionWithObstacle;
    }

    return { x, y };
}

export class Square {
    constructor(
        x,
        y,
        width,
        text,
        fillColorSq,
        fillColorText,
        isCorrectAnswer = false,
        isWrongAnswer = false,
        imageSrc = null,
        emoji = null,
        player = false
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.text = text;
        this.fillColorSq = fillColorSq;
        this.fillColorText = fillColorText;
        this.isCorrectAnswer = isCorrectAnswer; // Flag to indicate if it's the correct answer
        this.isWrongAnswer = isWrongAnswer; // Flag to indicate if it's a wrong answer
        this.imageSrc = imageSrc;  // Optional: Path to an image
        this.image = null;         // Holds the loaded image object if provided
        this.emoji = emoji;
        this.player = false; // Indicates if this square is the player's square
        this.isColliding = false;   // Flag for collision

        if (this.imageSrc) {
            this.image = new Image();
            this.image.src = this.imageSrc;
        }
    }

    drawRect(ctx) {
        const cornerRadius = 2;

        if (!this.emoji) {
            // Set the color dynamically based on square type
            if (this.player) {
                if (squarePlayerArray.indexOf(this) !== 0) {
                    ctx.fillStyle = getColorByName('Orange');
                }
            } else {
                ctx.fillStyle = this.fillColorSq || "rgba(0, 0, 0, 0)";
            }

            // Draw square with rounded corners
            ctx.beginPath();
            ctx.roundRect(this.x + 1, this.y + 1, this.width - 2, this.width - 2, cornerRadius);
            ctx.fill();
        }

        // Draw text or emoji
        ctx.fillStyle = this.fillColorText;
        ctx.font = this.emoji ? `${this.width - 4}px Arial` : "30px 'ComputerPixel', monospace";
        ctx.textAlign = this.emoji ? "center" : "left";
        ctx.textBaseline = "middle";
        const textX = this.emoji ? this.x + this.width / 2 : this.x + 4;
        const textY = this.y + this.width / 2;
        ctx.fillText(this.text || this.emoji, textX, textY);
    }
}