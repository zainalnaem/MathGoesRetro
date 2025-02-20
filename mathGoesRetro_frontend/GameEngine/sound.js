/**
 * Name: MathGoesRetro
 * Author: Paul Schöpfer
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles sound effects for the game, including initialization, playback, 
 * and predefined sound instances for obstacles, collisions, points, and game over events.
 */


export class Sound {
    constructor(src) {
        this.audio = new Audio(src);
        this.audio.muted = true; // Initialize as muted
    }

    play() {
        try {
            this.audio.currentTime = 0; // Always play from the beginning
            this.audio.muted = false; // De-mute before playing
            this.audio.play();
        } catch (err) {
            console.error(`Sound playback failed for ${this.audio.src}:`, err);
        }
    }
}

export const obstacleSound = new Sound('../GameEngine/sound/buzz-grid-sounds-wav/thunk.wav');
export const collisionSound = new Sound('../GameEngine/sound/buzz-grid-sounds-wav/crash.wav');
export const pointsSound = new Sound('../GameEngine/sound/buzz-grid-sounds-wav/ding2.wav');
export const gameOverSound = new Sound('../GameEngine/sound/Game_Over.wav');
export const motorRunningSound = new Sound('../GameEngine/sound/loop_0.wav');
export const pointsTrafficSound = new Sound('../GameEngine/sound/8BitCarGameSoundEffects/FillingTheTank.wav');
export const collisionTrafficSound = new Sound('../GameEngine/sound/8BitCarGameSoundEffects/ReplacedTheEngine.wav');

pointsTrafficSound.volume = 0.5; // Set volume to 50%
