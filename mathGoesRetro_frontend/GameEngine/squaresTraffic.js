/**
 * Name: MathGoesRetro
 * Author: Paul Schöpfer
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Manages game objects and task handling for the Traffic Math game.
 * Handles fetching and loading tasks, generating answer squares, 
 * and defining the Square class for rendering game elements.
 */


import { BORDER_MARGIN, BLOCK_SIZE } from './globals.js';
import { getColorByName } from './c64Colors.js';
import {
    canvasHeight, lanes, currentStage
} from './mainTrafficMath.js';

export let squarePlayerArrayCar = [];       // Will be used for player's body later, e.g. the car

// Simulate task fetching and randomization
export let tasks = []; // List of tasks fetched from server or predefined
let currentTask = null;
let question = "";
export let answerSquares = [];    // 1 Correct and 1-3 wrong answers
export let correctAnswerSquare;     // This will hold the current square for correct answer
let correctAnswer = "";             // Text inside of the answer
let wrongAnswer1 = "";              // Text inside of the answer
let wrongAnswer2 = "";              // Text inside of the answer

const AMOUNT_OBSTACLES = 8;                // Amount of obstacles for Level 3
const MIN_DIST_BORDER = 2;              // Minimum distance from the border for obstacles

let occupiedLanes = [];  // Array to store occupied lanes for placing answer squares

import { mathTopic } from './mainTrafficMath.js';

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
    if (tasks.length === 0) {
        console.error("No tasks available.");
        return;  // Don't proceed if no tasks are available
    }
    if (tasks.length > 0) {

        // Filters all tasks by topic
        const filteredTasks = tasks.filter(task => task.topic === mathTopic);

        if (filteredTasks.length > 0) {
            // Pick a random task out of filtered ones
            const randomTask = filteredTasks[Math.floor(Math.random() * filteredTasks.length)];
            currentTask = randomTask;

            renderQuestion();
            renderAnswers();
        } else {
            console.warn(`No tasks for "${mathTopic}" found.`);
            currentTask = null; // Set currentTask to null, if no task is found
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
}

export function createAnswerSquares() {
    answerSquares = [];
    createCorrectAnswerSquare();

    let maxTries = 10; // Max 10 tries to generate wrong answers
    let tries = 0;

    while (tries < maxTries) {
        createWrongAnswersSquareTraffic();

        // Check if all answer squares are in different lanes
        let laneSet = new Set(answerSquares.map(sq => sq.x));
        if (laneSet.size === answerSquares.length) {
            break;
        }

        console.warn("Doppelte Lane erkannt! Neuer Versuch...");
        answerSquares = [correctAnswerSquare]; // Keep correct answer, try again
        tries++;
    }
}

// Initialize player's square (car)
export function createPlayerSquareArrayCar() {
    squarePlayerArrayCar = [
        new Square(
            lanes[1],
            canvasHeight - BORDER_MARGIN - 2 * BLOCK_SIZE,
            BLOCK_SIZE,
            "",
            getColorByName('Orange'),
            "",
            false,
            false,
            null,
            "",
            true // Segment for player
        ),
        new Square(
            lanes[1],
            canvasHeight - BORDER_MARGIN - BLOCK_SIZE,
            BLOCK_SIZE,
            "",
            getColorByName('Orange'),
            "",
            false,
            false,
            null,
            "",
            true // Segment for player
        )
    ];
}

// Create a new square for correct answer at a random position
function createCorrectAnswerSquare() {
    const { x, y } = generateValidPositionTraffic();

    // Create new square for correct answer
    correctAnswerSquare = new Square(
        x,
        y,
        BLOCK_SIZE,
        correctAnswer,      // Text
        "",                 // Color of square
        getColorByName('Green'), // Color of text
        true,               // True: Marking it as a correct answer
        false,              // False: Marking it as a wrong answer
        null,               // No image
        ""                  // 🍓
    );

    answerSquares.push(correctAnswerSquare);
}

function createWrongAnswersSquareTraffic() {
    let wrongAnswers = [];

    switch (currentStage) {
        case 1:
            wrongAnswers = [wrongAnswer1];
            break;
        case 2:
        case 0:
            wrongAnswers = [wrongAnswer1, wrongAnswer2];
            break;
        default:
            wrongAnswers = [];
    }

    wrongAnswers.forEach((wrongAnswer) => {
        const { x, y } = generateValidPositionTraffic();

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

function generateValidPositionTraffic() {
    let availableLanes = lanes.filter(lane => !occupiedLanes.includes(lane));

    if (availableLanes.length === 0) {
        console.warn("No available lanes! Resetting occupied lanes...");
        occupiedLanes = []; // Clear all occupied lanes
        availableLanes = [...lanes]; // Fill available lanes with all lanes
    }

    if (availableLanes.length === 0) {
        console.error("Fehler: Keine Lanes verfügbar!");
        return { x: lanes[0], y: BORDER_MARGIN }; // Return first lane as fallback
    }

    const randomLaneIndex = Math.floor(Math.random() * availableLanes.length);
    const x = availableLanes[randomLaneIndex];

    occupiedLanes.push(x); // Save occupied lane

    return { x, y: BORDER_MARGIN };
}

class Square {
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
                if (squarePlayerArrayCar.indexOf(this) !== 0) {
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
        // Only draw the emoji, not the text (since text is handled by KaTeX)
        if (this.emoji) {
            ctx.fillText(this.emoji, textX, textY);
        }
    }
}