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

export const obstacleSound = new Sound('./sound/buzz-grid-sounds-wav/thunk.wav');
export const collisionSound = new Sound('./sound/buzz-grid-sounds-wav/crash.wav');
export const pointsSound = new Sound('./sound/buzz-grid-sounds-wav/ding2.wav');
export const gameOverSound = new Sound('./sound/Game_Over.wav');