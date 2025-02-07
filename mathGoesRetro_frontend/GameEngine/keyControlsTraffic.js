export let currentDirection;
export let isMoving = false; // Flag to prevent multiple movements at once

export function keyControl() {
    // Initialisieren von Bewegungsflags
    window.RIGHT = false;
    window.LEFT = false;
    
    // Flag für die aktuelle Richtung
    currentDirection = null;

    // Verhindern von 180-Grad-Umdrehungen
    const isOppositeDirection = (newDirection) => {
        return (
            (currentDirection === "RIGHT" && newDirection === "LEFT") ||
            (currentDirection === "LEFT" && newDirection === "RIGHT")
        );
    };

    // Steuerung für "keydown"-Ereignisse
    window.addEventListener("keydown", (e) => {
        // Wenn das Auto sich bereits bewegt, nichts tun
        if (isMoving) return;

        let newDirection = null;

        if (e.code === "ArrowRight" && car[0].x < lanes[2]) newDirection = "RIGHT";
        if (e.code === "ArrowLeft" && car[0].x > lanes[0]) newDirection = "LEFT";

        // Wenn eine neue Richtung bestätigt wird, setze das Flag und ändere die Richtung
        if (newDirection && !isOppositeDirection(newDirection)) {
            currentDirection = newDirection;
            isMoving = true; // Markiere, dass eine Bewegung stattfindet
        }
    });

    // Steuerung für "keyup"-Ereignisse
    window.addEventListener("keyup", () => {
        // Bewegung zurücksetzen, wenn die Taste losgelassen wird
        isMoving = false;
    });
}