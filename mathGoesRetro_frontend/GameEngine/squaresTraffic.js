import { BORDER_MARGIN, BLOCK_SIZE } from './globals.js';
import { getColorByName } from './c64Colors.js';
import {
    canvasWidth, canvasHeight, lanes
} from './mainTrafficMath.js';

export const answerSquares = [];    // 1 Correct and 3 wrong answers
export let squarePlayerArrayCar = [];       // Will be used for player's body later, e.g. the car
export let correctAnswerSquare;     // This will hold the current square for correct answer

export const obstacles = [];           // Will be used for obstacles later
const AMOUNT_OBSTACLES = 8;                // Amount of obstacles for Level 3
const MIN_DIST_BORDER = 2;              // Minimum distance from the border for obstacles

let occupiedLanes = [];  // Array zum Verfolgen der belegten Lanes

// Simulate task fetching and randomization
export let tasks = []; // List of tasks fetched from server or predefined
let currentTask = null;
export let question = "";
let correctAnswer = "";
let wrongAnswer1 = "";
let wrongAnswer2 = "";
let wrongAnswer3 = "";

let currentStage = 4;

import { mathTopic } from './mainTrafficMath.js';

export async function fetchTasks() {
    try {
        const response = await fetch('http://localhost:3000/api/tasks');
        tasks = await response.json();
        loadRandomTask();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Load random task
export function loadRandomTask() {
    if (tasks.length > 0) {

        // Filters all tasks by topic
        const filteredTasks = tasks.filter(task => task.topic === mathTopic);

        if (filteredTasks.length > 0) {
            // Pick a random task out of filtered ones
            const randomTask = filteredTasks[Math.floor(Math.random() * filteredTasks.length)];
            currentTask = randomTask;

            renderQuestion();
            renderAnswers();
            console.log("Task nach loadRandomTask:", currentTask);

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
    wrongAnswer3 = currentTask.wrong_answer3;
}

// Initialize the player's square and squares for correct answer and wrong answers
export function initializeSquaresArray() {
    createPlayerSquareArrayCar();  // Add the player to the squares array
    createAnswerSquaresTraffic();
}

export function createAnswerSquaresTraffic() {
    createCorrectAnswerSquare();
    createWrongAnswersSquareTraffic();
}

// Initialize player's square (car)
function createPlayerSquareArrayCar() {
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
            true // Spielersegment
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
            true // Spielersegment
        )
    ];
}

// Create a new square for correct answer at a random position
export function createCorrectAnswerSquare() {
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
    console.log("ansSq after init creatCorAnsSq: ", answerSquares);
}

export function createWrongAnswersSquareTraffic() {
    let wrongAnswers = [];

    // Überprüfe, ob das aktuelle Level eines der genannten Levels ist
    if ([1, 4, 7].includes(currentStage)) {
        wrongAnswers = [wrongAnswer1];
    } else if ([2, 3, 5, 6, 8, 9].includes(currentStage)) {
        wrongAnswers = [wrongAnswer1, wrongAnswer2];
    }

    wrongAnswers.forEach((wrongAnswer, index) => {
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
        console.log("ansSq after init creatWrAnsSq: ", answerSquares);
    });
}

function generateValidPositionTraffic() {
    let randomLaneIndex;
    let x, y;

    do {
        // Wähle eine zufällige Lane (0, 1 oder 2)
        randomLaneIndex = Math.floor(Math.random() * lanes.length);

        // Berechne die X-Position, die der Mitte der zufälligen Lane entspricht
        x = lanes[randomLaneIndex];

        // Setze die Y-Position am oberen Rand der Canvas
        y = BORDER_MARGIN;
    } while (occupiedLanes.includes(randomLaneIndex)); // Überprüfe, ob die Lane bereits besetzt ist

    // Markiere die Lane als besetzt
    occupiedLanes.push(randomLaneIndex);

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
                    console.log("Setting color to Orange");
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