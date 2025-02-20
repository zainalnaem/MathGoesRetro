/**
 * Name: MathGoesRetro
 * Author: Zain Aldin Zaher Alnaem
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Manages game logic for Number Kruncher, including task handling, 
 * generating answer squares, obstacles, and rendering game elements.
 */


import { BORDER_MARGIN, BLOCK_SIZE, canvasWidth, canvasHeight } from './globalsKruncher.js';
import { getColorByName } from './c64Colors.js';
import { currentLevel, mathTopic } from './mainNumber.js';
import { walls } from './mainNumber.js';

export const answerSquares = []; // 1 Correct and 3 wrong answers
export let squarePlayer;
export let correctAnswerSquare; // This will hold the square for the correct answer

export const obstacles = []; // Will be used for obstacles later
const AMOUNT_OBSTACLES = 8; // Amount of obstacles for Level 3
const MIN_DIST_BORDER = 2; // Minimum distance from the border for obstacles

export let tasks = []; // List of tasks fetched from server or predefined
let currentTask = null;
export let question = "";
let correctAnswer = "";
let wrongAnswer1 = "";
let wrongAnswer2 = "";
let wrongAnswer3 = "";
export let correctAnswerColor = null; // Store the correct answer's color
let wrongAnswerColors = []; // Store the colors for the wrong answers

export async function fetchTasks() {
    try {
        const response = await fetch('http://localhost:3000/api/tasks');
        tasks = await response.json();
        loadRandomTask();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

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

        // Filter tasks by topic, status, and difficulty level
        const filteredTasks = tasks.filter(
            task => task.topic === mathTopic && task.status === 'a' && task.difficulty === difficultyLevel
        );

        if (filteredTasks.length > 0) {
            // Pick a random task from the filtered ones
            const randomTask = filteredTasks[Math.floor(Math.random() * filteredTasks.length)];
            currentTask = randomTask;
            renderQuestion();
            renderAnswers();
        } else {
            console.warn(`No tasks for topic "${mathTopic}" and difficulty "${difficultyLevel}" found.`);
            currentTask = null; // Set currentTask to null if no task matches
        }
    } else {
        console.error("No tasks available.");
    }
}


function renderQuestion() {
    const questionDiv = document.querySelector('.question');
    if (questionDiv && currentTask) {
        question = currentTask.question;
        questionDiv.innerHTML = '';
        katex.render(question, questionDiv, { throwOnError: false });
    } else {
        console.error('Question element not found or currentTask is undefined.');
    }
}

function renderAnswers() {
    // Collect all answers
    const allAnswers = [
        { text: currentTask.correct_answer, isCorrect: true },
        { text: currentTask.wrong_answer1, isCorrect: false },
        { text: currentTask.wrong_answer2, isCorrect: false },
        { text: currentTask.wrong_answer3, isCorrect: false }
    ];
    let activeAnswers;
    // Define a list of colors for answers
    const answerColors = ['#FF5733', '#33FF57', '#7C08FF', '#F3F6F4']; // Example colors
    shuffleArray(answerColors); // Shuffle colors randomly

    if (currentLevel === 1 || currentLevel === 4 || currentLevel === 7) {
        // Select the correct answer and one wrong answer for level 1
        const correctAnswer = allAnswers.find(answer => answer.isCorrect);
        const wrongAnswer = allAnswers.find(answer => !answer.isCorrect);
        activeAnswers = [correctAnswer, wrongAnswer];
    } else {
        // Use all four answers for other levels
        activeAnswers = [...allAnswers];
    }
    wrongAnswerColors = []; // To store the colors of the wrong answers

    // Shuffle the active answers
    shuffleArray(activeAnswers);

    // Render shuffled answers to their respective divs
    const answerDivs = [
        document.querySelector('.answer1'),
        document.querySelector('.answer2'),
        document.querySelector('.answer3'),
        document.querySelector('.answer4')
    ];

    activeAnswers.forEach((answer, index) => {
        const answerDiv = answerDivs[index];
        answerDiv.style.display = 'block'; // Show only the active answer divs
        answerDiv.innerHTML = '';

        let color;

        if (answer.isCorrect) {
            color = answerColors[0]; // Assign the first color to the correct answer
            correctAnswerColor = color; // Store the correct answer's color
        } else {
            // Filter out the correct answer's color and store the remaining colors for the wrong answers
            color = answerColors.find(c => c !== correctAnswerColor); // Get a color that's not the correct answer color
            wrongAnswerColors.push(color); // Store the remaining colors for the wrong answers
            answerColors.splice(answerColors.indexOf(color), 1); // Remove the used color from the answerColors array
        }

        answerDiv.style.backgroundColor = color;
        katex.render(answer.text, answerDiv, { throwOnError: false });

        // Update global variables for answers
        if (answer.isCorrect) {
            correctAnswer = answer.text;
            correctAnswerColor = color; // Save the correct answer's color
        } else {
            if (!wrongAnswer1) wrongAnswer1 = answer.text;
            else if (!wrongAnswer2) wrongAnswer2 = answer.text;
            else wrongAnswer3 = answer.text;
        }
    });
}

// Utility function to shuffle an array using Fisher-Yates
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

export function initializeSquares() {
    createPlayerSquare();
    createCorrectAnswerSquare(correctAnswerColor);
    createWrongAnswersSquare();
}

function createPlayerSquare() {
    squarePlayer = new Square(
        BORDER_MARGIN,
        BORDER_MARGIN,
        BLOCK_SIZE,
        "",
        getColorByName('Yellow'),
        "",
        false,
        false,
        null,
        ""
    );
}

export function createCorrectAnswerSquare(correctAnswerColor) {
    if (!correctAnswerColor) {
        console.error("Correct answer color is undefined. Cannot create the correct answer square.");
        return;
    }
    const { x, y } = generateValidPosition();

    correctAnswerSquare = new Square(
        x,
        y,
        BLOCK_SIZE,
        "",
        correctAnswerColor,
        "",
        true,
        false,
        null,
        ""
    );

    answerSquares.push(correctAnswerSquare);
}

export function createWrongAnswersSquare() {
    const wrongAnswers = [wrongAnswer1, wrongAnswer2, wrongAnswer3]; // Always have all three wrong answers
    const activeWrongAnswers = (currentLevel === 1 || currentLevel === 4 || currentLevel === 7) ? wrongAnswers.slice(0, 1) : wrongAnswers; // Select based on level
    const activeWrongAnswerColors = wrongAnswerColors.slice(0, activeWrongAnswers.length); // Match colors to active wrong answers

    // Ensure that the number of active wrong answers and colors match
    if (activeWrongAnswers.length !== activeWrongAnswerColors.length) {
        console.error('Mismatch between wrong answers and colors');
        return; // Prevent the function from running if there's an issue
    }

    activeWrongAnswers.forEach((wrongAnswer, index) => {
        const { x, y } = generateValidPosition();

        const wrongAnswerSquare = new Square(
            x,
            y,
            BLOCK_SIZE,
            "",
            activeWrongAnswerColors[index], // Assign the corresponding color
            "",
            false,
            true,
            null,
            ""
        );

        answerSquares.push(wrongAnswerSquare);
    });
}

export function createObstacles() {
    if (currentLevel === 3) {
        for (let i = 0; i < AMOUNT_OBSTACLES; i++) {
            const { x, y } = generateValidPosition(true);

            const obstacle = new Square(
                x,
                y,
                BLOCK_SIZE,
                "",
                getColorByName('Grey'),
                "",
                false,
                false,
                null,
                ""
            );

            obstacles.push(obstacle);
        }
    }
}

function generateValidPosition(isObstacle = false) {
    let positionValid = false;
    let x, y;

    while (!positionValid) {
        x = Math.floor((Math.random() * (canvasWidth - 2 * BORDER_MARGIN)) / BLOCK_SIZE) * BLOCK_SIZE + BORDER_MARGIN;
        y = Math.floor((Math.random() * (canvasHeight - 2 * BORDER_MARGIN)) / BLOCK_SIZE) * BLOCK_SIZE + BORDER_MARGIN;

        const minDistanceFromBorder = isObstacle
            ? BORDER_MARGIN + BLOCK_SIZE * MIN_DIST_BORDER
            : BORDER_MARGIN;

        const withinPlayableArea = (
            x >= minDistanceFromBorder &&
            y >= minDistanceFromBorder &&
            x < canvasWidth - minDistanceFromBorder &&
            y < canvasHeight - minDistanceFromBorder
        );

        const noCollisionWithSquare = !answerSquares.some(square => square.x === x && square.y === y);
        const noCollisionWithObstacle = !obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
        // Check collision with walls from mainNumber.js (assuming walls is an array of wall objects)
        const noCollisionWithWalls = !walls.some(wall => wall.x === x && wall.y === y);


        positionValid = withinPlayableArea && noCollisionWithSquare && noCollisionWithObstacle && noCollisionWithWalls;
    }

    return { x, y };
}

export class Square {
    constructor(x, y, width, text, fillColorSq, fillColorText, isCorrectAnswer, isWrongAnswer, imageSrc, emoji, player = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.text = text;
        this.fillColorSq = fillColorSq;
        this.fillColorText = fillColorText;
        this.isCorrectAnswer = isCorrectAnswer;
        this.isWrongAnswer = isWrongAnswer;
        this.imageSrc = imageSrc;
        this.image = this.imageSrc ? new Image() : null;
        if (this.image) this.image.src = imageSrc;
        this.emoji = emoji;
        this.player = player;
        this.isColliding = false;
    }

    drawRect(ctx) {
        const cornerRadius = 2;

        if (!this.emoji) {
            ctx.fillStyle = this.player && squarePlayer.indexOf(this) !== 0
                ? getColorByName('Orange')
                : this.fillColorSq || "rgba(0, 0, 0, 0)";

            ctx.beginPath();
            ctx.roundRect(this.x + 1, this.y + 1, this.width - 2, this.width - 2, cornerRadius);
            ctx.fill();
        }

        ctx.fillStyle = this.fillColorText;
        ctx.font = this.emoji ? `${this.width - 4}px Arial` : "30px 'ComputerPixel', monospace";
        ctx.textAlign = this.emoji ? "center" : "left";
        ctx.textBaseline = "middle";
        const textX = this.emoji ? this.x + this.width / 2 : this.x + 4;
        const textY = this.y + this.width / 2;
        ctx.fillText(this.text || this.emoji, textX, textY);
    }
}