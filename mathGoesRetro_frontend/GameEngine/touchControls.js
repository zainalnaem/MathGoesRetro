/**
 * Name: MathGoesRetro
 * Author: Paul Schöpfer
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Sets up touch and mouse event listeners for movement controls. 
 * Handles directional input and visual feedback for control buttons.
 */

// Store references to the control buttons
const controls = {
    UP: document.getElementById("up"),
    DOWN: document.getElementById("down"),
    LEFT: document.getElementById("left"),
    RIGHT: document.getElementById("right"),
};

// Add event listeners for touch and mouse events
Object.entries(controls).forEach(([direction, button]) => {
    // Touch events
    button.addEventListener("touchstart", () => handleMove(direction, true));
    button.addEventListener("touchend", () => handleMove(direction, false));

    // Mouse events
    button.addEventListener("mousedown", () => handleMove(direction, true));
    button.addEventListener("mouseup", () => handleMove(direction, false));

    // Visual feedback for active state
    button.addEventListener("touchstart", () => button.classList.add("active"));
    button.addEventListener("touchend", () => button.classList.remove("active"));
    button.addEventListener("mousedown", () => button.classList.add("active"));
    button.addEventListener("mouseup", () => button.classList.remove("active"));
});

/**
 * Handles movement state based on the given direction and action.
 * 
 * @param {string} direction - Direction of movement ("UP", "DOWN", "LEFT", "RIGHT").
 * @param {boolean} isActive - True if the button is pressed, false if released.
 */
function handleMove(direction, isActive) {
    window[direction] = isActive; // Update the movement state globally
}