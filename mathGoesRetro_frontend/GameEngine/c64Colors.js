/**
 * Name: MathGoesRetro
 * Author: Paul Schöpfer
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Provides the C64 color palette with functions to retrieve 
 * specific, all, or random colors for game elements.
 */

// C64 Color Palette: These are hexadecimal representations of the original C64 colors.
const C64_COLORS = {
    // preferred ones:
    Black: '#000000',
    White: '#FFFFFF',
    Aqua: '#7ABFC7',
    Purple: '#3E31A2',
    LightPurple: '#49427E',
    Lavender: '#7C70DA',
    Lime: '#D0DC71',
    Plum: '#8A46AE',
    Grey: '#555555',
    Apricot: '#894036',
    Green: '#68A941',

    // additional ones:
    Blue: '#0000D4',
    Yellow: '#D4D400',
    Orange: '#D46000',
    Brown: '#8C3F1A',
    LightRed: '#FF4040',
    DarkGrey: '#808080',
    LightGreen: '#40FF40',
    LightBlue: '#4040FF',
    LightGrey: '#D4D4D4'
};

// Gets a specific color by name
export function getColorByName(name) {
    return C64_COLORS[name] || null;
}

/**
 * Gets the full C64 color palette.
 * @returns {string[]} An array of hexadecimal color values.
 */
export function getAllColors() {
    return C64_COLORS;
}

/**
 * Gets a random color from the palette.
 * @returns {string} A random hexadecimal color value.
 */
export function getRandomColor() {
    const colorNames = Object.keys(C64_COLORS);
    const randomIndex = Math.floor(Math.random() * colorNames.length);
    return C64_COLORS[colorNames[randomIndex]];
}