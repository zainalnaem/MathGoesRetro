/**
 * Name: MathGoesRetro
 * Author: Paul Schöpfer
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles player movement with directional input, ensuring movement 
 * stays within boundaries while detecting collisions with obstacles.
 */

import { BLOCK_SIZE, canvasWidth, canvasHeight, BORDER_MARGIN } from './globals.js';
import { collisionMessage } from './collision.js';
import { obstacleSound } from './sound.js';

let lastMoveTime = 0;
const MOVE_DELAY = 80;

export function handleMovement(playerSquare, timestamp) {
    if (timestamp - lastMoveTime < MOVE_DELAY) return;

    const { width, height } = { width: canvasWidth, height: canvasHeight };
    let collisionWithObstacle = false;

    const movePlayer = (direction, delta, boundaryCheck) => {
        if (direction && boundaryCheck()) {
            delta();
        } else if (direction) {
            collisionWithObstacle = true;
        }
    };

    movePlayer(
        window.RIGHT,
        () => (playerSquare.x += BLOCK_SIZE),
        () => playerSquare.x + playerSquare.width + BLOCK_SIZE <= width - BORDER_MARGIN
    );

    movePlayer(
        window.LEFT,
        () => (playerSquare.x -= BLOCK_SIZE),
        () => playerSquare.x - BLOCK_SIZE >= BORDER_MARGIN
    );

    movePlayer(
        window.UP,
        () => (playerSquare.y -= BLOCK_SIZE),
        () => playerSquare.y - BLOCK_SIZE >= BORDER_MARGIN
    );

    movePlayer(
        window.DOWN,
        () => (playerSquare.y += BLOCK_SIZE),
        () => playerSquare.y + playerSquare.height + BLOCK_SIZE <= height - BORDER_MARGIN
    );

    if (collisionWithObstacle) {
        console.warn("Player unable to move.");
        collisionMessage.show = true;
        collisionMessage.text = "COLLISION WITH OBSTACLE!";
        collisionMessage.alpha = 1.0;
        obstacleSound.play();
    }

    lastMoveTime = timestamp;   // Update timestamp of last movement
}