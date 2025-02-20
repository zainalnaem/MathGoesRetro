/**
 * Name: MathGoesRetro
 * Author: Paul Schöpfer
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles keyboard input for player movement in the Traffic Math game, 
 * allowing left and right movement within predefined lanes.
 */

import { car, lanes } from "./mainTrafficMath.js";

export let isMoving = false;

export function keyControl() {
    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft" && car.x > lanes[0]) {
            car.x = lanes[lanes.indexOf(car.x) - 1]; // Move left
        } else if (event.key === "ArrowRight" && car.x < lanes[2]) {
            car.x = lanes[lanes.indexOf(car.x) + 1]; // Move right
        }
    });
}