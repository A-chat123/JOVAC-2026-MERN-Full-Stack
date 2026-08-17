// Single source of truth for allowed moods on the frontend.
// Keep this in sync with Backend/src/constants/moods.js.
//
// This is intentionally a SUBSET of what face-api.js can detect
// (neutral, happy, sad, angry, fearful, disgusted, surprised) —
// songs can only be tagged with one of these four moods.
export const MOODS = ["neutral", "happy", "sad", "angry"];
