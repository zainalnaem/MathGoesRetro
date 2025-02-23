/**
 * Name: MathGoesRetro
 * Author: Paul Schöpfer
 * Version: 0.2
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles keyboard and touch input for player movement in the Traffic Math game,
 * allowing left and right movement within predefined lanes.
 */

import { car, lanes } from "./mainTrafficMath.js";

export let isMoving = false;

export function keyControl() {
    // Listen for keyboard arrows
    document.addEventListener("keydown", (event) => {
        let carIndex = getClosestLaneIndex(car[0].x);

        if (event.key === "ArrowLeft" && carIndex > 0) {
            car.forEach((square) => {
                square.x = lanes[carIndex - 1]; // Move left by one lane
            });
        } else if (event.key === "ArrowRight" && carIndex < lanes.length - 1) {
            car.forEach((square) => {
                square.x = lanes[carIndex + 1]; // Move right by one lane
            });
        }
    });
}

export function touchControl() {
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener("touchstart", (event) => {
        touchStartX = event.touches[0].clientX;
    });

    document.addEventListener("touchend", (event) => {
        touchEndX = event.changedTouches[0].clientX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50; // Minimum swipe distance
        let carIndex = getClosestLaneIndex(car[0].x);

        if (touchEndX < touchStartX - swipeThreshold && carIndex > 0) {
            // Swipe left
            car.forEach((square) => {
                square.x = lanes[carIndex - 1];
            });
        } else if (touchEndX > touchStartX + swipeThreshold && carIndex < lanes.length - 1) {
            // Swipe right
            car.forEach((square) => {
                square.x = lanes[carIndex + 1];
            });
        }
    }
}

/**
 * Finds which lane is closest to carX, snaps the car squares to that lane,
 * and returns the index of that lane in the lanes array.
 */
function getClosestLaneIndex(carX) {
    let closestIndex = 0;
    let minDiff = Math.abs(carX - lanes[0]);

    for (let i = 1; i < lanes.length; i++) {
        let diff = Math.abs(carX - lanes[i]);
        if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
        }
    }

    // Snap the car's x to the closest lane
    car.forEach((square) => {
        square.x = lanes[closestIndex];
    });

    return closestIndex;
}

// Initialize both controls right away
keyControl();
touchControl();
