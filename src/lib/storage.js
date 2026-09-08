import { STORAGE_KEY } from "./constants.js";

/* localStorage can throw in private windows and embedded frames. */
export function readSaved() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeSaved(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* progress just won't persist — the drill still works */
  }
}
