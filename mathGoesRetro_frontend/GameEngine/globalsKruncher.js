// Global attributes, game settings

export const BLOCK_SIZE = 30;   // Size of the box (snake and food)
export const BORDER_MARGIN = 3; // Margin from edge for squares

export const canvas = document.getElementById("canvas");
export const canvasWidth = canvas.width;
export const canvasHeight = canvas.height;
export const innerWidth = canvasWidth - 2 * BORDER_MARGIN;
export const innerHeight = canvasHeight - 2 * BORDER_MARGIN;
export const amountBoxes = canvasWidth / BLOCK_SIZE; // Number of boxes horizontally and vertically

export const scoreDisplay = document.querySelector('.score');
export const questionDisplay = document.querySelector('.question');