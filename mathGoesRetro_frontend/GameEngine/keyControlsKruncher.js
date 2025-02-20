/**
 * Name: MathGoesRetro
 * Author: Zain Aldin Zaher Alnaem
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles keyboard input for player movement in the Number Kruncher game,
 * Manages player movement via keyboard and touch gestures, 
 * updating direction flags for smooth controls on both desktop and mobile.
 */


export function keyControl() {
    // Initialize movement flags
    window.RIGHT = false;
    window.LEFT = false;
    window.UP = false;
    window.DOWN = false;

    let currentDirection = null; // Keeps track of the current direction

    // Keyboard control for "keydown" event
    window.addEventListener("keydown", (e) => {
        let newDirection = null;

        if (e.code === "ArrowRight") newDirection = "RIGHT";
        if (e.code === "ArrowLeft") newDirection = "LEFT";
        if (e.code === "ArrowUp") newDirection = "UP";
        if (e.code === "ArrowDown") newDirection = "DOWN";

        // Update direction without checking for 180-degree turns (no restriction here)
        if (newDirection) {
            currentDirection = newDirection;

            // Reset all flags and set the new direction
            window.RIGHT = newDirection === "RIGHT";
            window.LEFT = newDirection === "LEFT";
            window.UP = newDirection === "UP";
            window.DOWN = newDirection === "DOWN";
        }
    });

    // No need to reset direction on "keyup" since we want to maintain the direction
    window.addEventListener("keyup", (e) => {
        // Do nothing here
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

        // Update direction without checking for 180-degree turns (no restriction here)
        if (newDirection) {
            currentDirection = newDirection;

            // Reset all flags and set the new direction
            window.RIGHT = newDirection === "RIGHT";
            window.LEFT = newDirection === "LEFT";
            window.UP = newDirection === "UP";
            window.DOWN = newDirection === "DOWN";
        }
    }
}