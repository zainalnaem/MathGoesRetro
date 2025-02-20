/**
 * Name: MathGoesRetro
 * Author: Paul Schöpfer
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Manages collision notifications, including displaying, fading, 
 * and detecting collisions between game elements.
 */

// `collisionMessage`-object for managing collisions by notifications
export const collisionMessage = {
    show: false, // If message is shown
    text: "", // Text to be shown
    alpha: 1.0, // Transparency (1.0 = fully visible, 0.0 = invisible)
};

// Function for drawing notification of collision
export function drawCollisionMessage(ctx, canvas) {
    if (!collisionMessage.show) return;

    ctx.save();
    ctx.globalAlpha = collisionMessage.alpha; // Set transparency
    ctx.fillStyle = "red";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(collisionMessage.text, canvas.width / 2, canvas.height / 2);
    ctx.restore();
}

// Function for slowly fading out of notification of collision
export function fadeCollisionMessage() {
    if (!collisionMessage.show) return;

    collisionMessage.alpha -= 0.008; // Decrease transparency
    if (collisionMessage.alpha <= 0) {
        collisionMessage.alpha = 0;
        collisionMessage.show = false; // Terminate notification
    }
}

// Proving, if two squares collide
export function isColliding(square1, square2) {
    const collides = (
        square1.x < square2.x + square2.width &&
        square1.x + square1.width > square2.x &&
        square1.y < square2.y + square2.height &&
        square1.y + square1.height > square2.y
    );
    if (collides) {
        console.log("Collision detected between: ", square1, square2);
    }
    return collides;
}