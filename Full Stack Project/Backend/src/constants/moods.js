// Single source of truth for allowed moods.
// Keep this in sync with Frontend/src/constants/moods.js —
// it must be a subset of the expressions face-api.js can detect
// (neutral, happy, sad, angry, fearful, disgusted, surprised).
const MOODS = ["neutral", "happy", "sad", "angry"];

module.exports = MOODS;
