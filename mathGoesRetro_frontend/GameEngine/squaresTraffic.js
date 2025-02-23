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

import { BORDER_MARGIN, BLOCK_SIZE } from "./globals.js";
import { getColorByName } from "./c64Colors.js";
import { canvasHeight, lanes, currentStage } from "./mainTrafficMath.js";

export let squarePlayerArrayCar = []; // Will be used for player's body later (the car)

// Simulate task fetching and randomization
export let tasks = [];
let currentTask = null;
let question = "";
export let answerSquares = [];
export let correctAnswerSquare;

let correctAnswer = "";
let wrongAnswer1 = "";
let wrongAnswer2 = "";

let occupiedLanes = []; // which lanes are used by falling squares
import { mathTopic } from "./mainTrafficMath.js";

export async function fetchTasks() {
    try {
        const response = await fetch("http://localhost:3000/api/tasks");
        tasks = await response.json();
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

// Load a random task
export function loadRandomTask() {
    if (tasks.length === 0) {
        console.error("No tasks available.");
        return;
    }
    // Filter tasks by chosen mathTopic
    const filteredTasks = tasks.filter((task) => task.topic === mathTopic);
    if (filteredTasks.length > 0) {
        // Random pick from filtered tasks
        const randomTask =
            filteredTasks[Math.floor(Math.random() * filteredTasks.length)];
        currentTask = randomTask;
        renderQuestion();
        renderAnswers();
    } else {
        console.warn(`No tasks found for topic: ${mathTopic}`);
        currentTask = null;
    }
}

function renderQuestion() {
    const questionDiv = document.querySelector(".question");
    if (questionDiv && currentTask) {
        question = currentTask.question;
        questionDiv.innerHTML = "";
        katex.render(question, questionDiv, {
            throwOnError: false,
        });
    } else {
        console.error("Question element not found or currentTask is undefined.");
    }
}

function renderAnswers() {
    correctAnswer = currentTask.correct_answer;
    wrongAnswer1 = currentTask.wrong_answer1;
    wrongAnswer2 = currentTask.wrong_answer2;
}

// Create squares for correct and wrong answers
export function createAnswerSquares() {
    answerSquares = [];
    createCorrectAnswerSquare();

    let maxTries = 10;
    let tries = 0;

    while (tries < maxTries) {
        createWrongAnswersSquareTraffic();
        // Ensure each answer is in a unique lane
        let laneSet = new Set(answerSquares.map((sq) => sq.x));
        if (laneSet.size === answerSquares.length) {
            break;
        }
        console.warn("Duplicate lane found. Retrying...");
        answerSquares = [correctAnswerSquare]; // Keep correct square, re-generate wrong squares
        tries++;
    }
}

// Initialize player's squares (the car) in the middle lane
export function createPlayerSquareArrayCar() {
    // We set them to lanes[1] so it spawns exactly in the middle lane
    squarePlayerArrayCar = [
        new Square(
            lanes[1],
            canvasHeight - BORDER_MARGIN - 2 * BLOCK_SIZE,
            BLOCK_SIZE,
            "",
            getColorByName("Orange"),
            "",
            false,
            false,
            null,
            "",
            true
        ),
        new Square(
            lanes[1],
            canvasHeight - BORDER_MARGIN - BLOCK_SIZE,
            BLOCK_SIZE,
            "",
            getColorByName("Orange"),
            "",
            false,
            false,
            null,
            "",
            true
        ),
    ];
}

function createCorrectAnswerSquare() {
    const { x, y } = generateValidPositionTraffic();

    correctAnswerSquare = new Square(
        x,
        y,
        BLOCK_SIZE,
        correctAnswer,
        "", // Square fill color
        getColorByName("Green"), // Text color
        true, // isCorrectAnswer
        false // isWrongAnswer
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

        const wrongAnswerSquare = new Square(
            x,
            y,
            BLOCK_SIZE,
            wrongAnswer,
            "",
            getColorByName("Plum"),
            false, // isCorrectAnswer
            true // isWrongAnswer
        );

        answerSquares.push(wrongAnswerSquare);
    });
}

/**
 * Picks a lane not currently occupied and spawns the square at y=BORDER_MARGIN.
 * If all lanes are taken, it resets occupiedLanes and tries again.
 */
function generateValidPositionTraffic() {
    let availableLanes = lanes.filter((lane) => !occupiedLanes.includes(lane));
    if (availableLanes.length === 0) {
        console.warn("No available lanes! Resetting occupied lanes...");
        occupiedLanes = [];
        availableLanes = [...lanes];
    }
    if (availableLanes.length === 0) {
        console.error("No lanes available at all!");
        return { x: lanes[0], y: BORDER_MARGIN };
    }

    const randomLaneIndex = Math.floor(Math.random() * availableLanes.length);
    const x = availableLanes[randomLaneIndex];
    occupiedLanes.push(x);

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
        this.isCorrectAnswer = isCorrectAnswer;
        this.isWrongAnswer = isWrongAnswer;
        this.imageSrc = imageSrc;
        this.image = null;
        this.emoji = emoji;
        this.player = player; // Is this square part of the player's car?
        this.isColliding = false;

        if (this.imageSrc) {
            this.image = new Image();
            this.image.src = this.imageSrc;
        }
    }

    drawRect(ctx) {
        const cornerRadius = 2;

        // If there's no emoji, we draw a filled rectangle
        if (!this.emoji) {
            // If it's the player's car
            if (this.player) {
                // The top segment might share the same color,
                // but if you want a different color for the second segment, do so here.
                ctx.fillStyle = getColorByName("Orange");
            } else {
                // For normal squares (answers, obstacles, etc.)
                ctx.fillStyle = this.fillColorSq || "rgba(0, 0, 0, 0)";
            }

            ctx.beginPath();
            ctx.roundRect(
                this.x + 1,
                this.y + 1,
                this.width - 2,
                this.width - 2,
                cornerRadius
            );
            ctx.fill();
        }

        // Draw text or emoji
        ctx.fillStyle = this.fillColorText;
        ctx.font = this.emoji
            ? `${this.width - 4}px Arial`
            : "30px 'ComputerPixel', monospace";
        ctx.textAlign = this.emoji ? "center" : "left";
        ctx.textBaseline = "middle";

        const textX = this.emoji ? this.x + this.width / 2 : this.x + 4;
        const textY = this.y + this.width / 2;

        if (this.emoji) {
            ctx.fillText(this.emoji, textX, textY);
        }
    }
}
