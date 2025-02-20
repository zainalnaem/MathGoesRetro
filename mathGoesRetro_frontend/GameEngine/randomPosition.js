/**
 * Name: MathGoesRetro
 * Author: Paul Schöpfer
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Generates a random grid-aligned position for a square while ensuring 
 * it does not collide with the player or existing answer squares, 
 * and maintains a minimum distance from the player's position.
 */

import { BORDER_MARGIN, BLOCK_SIZE, canvasWidth, canvasHeight } from './globals.js';
import { answerSquares } from './squaresMamba.js';

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