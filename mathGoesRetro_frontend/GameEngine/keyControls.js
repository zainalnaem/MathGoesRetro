/**
 * Name: MathGoesRetro
 * Author: Paul Schöpfer
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Manages player movement for the Math Mamba game via keyboard and swipe gestures
 * while preventing 180-degree turns for smoother and more controlled navigation.
 */


export let currentDirection;

export function keyControl() {
    // Initialize movement flags
    window.RIGHT = false;
    window.LEFT = false;
    window.UP = false;
    window.DOWN = false;

    currentDirection = null; // Keeps track of the current direction

    // Helper function to prevent 180-degree turns
    const isOppositeDirection = (newDirection) => {
        return (
            (currentDirection === "RIGHT" && newDirection === "LEFT") ||
            (currentDirection === "LEFT" && newDirection === "RIGHT") ||
            (currentDirection === "UP" && newDirection === "DOWN") ||
            (currentDirection === "DOWN" && newDirection === "UP")
        );
    };

    // Keyboard control for "keydown" event
    window.addEventListener("keydown", (e) => {
        let newDirection = null;

        if (e.code === "ArrowRight") newDirection = "RIGHT";
        if (e.code === "ArrowLeft") newDirection = "LEFT";
        if (e.code === "ArrowUp") newDirection = "UP";
        if (e.code === "ArrowDown") newDirection = "DOWN";

        console.log("Neue Richtung:", newDirection);


        // Update direction only if it is not a 180-degree turn
        if (newDirection && !isOppositeDirection(newDirection)) {
            currentDirection = newDirection;

            // Reset all flags and set the new direction
            window.RIGHT = newDirection === "RIGHT";
            window.LEFT = newDirection === "LEFT";
            window.UP = newDirection === "UP";
            window.DOWN = newDirection === "DOWN";
        }
    });

    // Touchscreen gestures for swipes
    let startX, startY;

    window.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
    });

    window.addEventListener("touchend", (e) => {
        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;

        handleSwipe(startX, startY, endX, endY);
    });

    // Handles swipe gestures to determine direction
    function handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        const threshold = 30; // Minimum swipe distance

        let newDirection = null;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
            // Horizontal swipe
            newDirection = deltaX > 0 ? "RIGHT" : "LEFT";
        } else if (Math.abs(deltaY) > threshold) {
            // Vertical swipe
            newDirection = deltaY > 0 ? "DOWN" : "UP";
        }

        // Update direction only if it is not a 180-degree turn
        if (newDirection && !isOppositeDirection(newDirection)) {
            currentDirection = newDirection;

            // Reset all flags and set the new direction
            window.RIGHT = newDirection === "RIGHT";
            window.LEFT = newDirection === "LEFT";
            window.UP = newDirection === "UP";
            window.DOWN = newDirection === "DOWN";
        }
    }
}