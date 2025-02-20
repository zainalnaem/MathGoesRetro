/**
 * Name: MathGoesRetro
 * Author: Zain Aldin Zaher Alnaem
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Defines global game settings and canvas properties, 
 * including block size, margins, dimensions, and UI elements
 * for the Number Kruncher game.
 */

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