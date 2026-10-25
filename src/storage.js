// Saves small pieces of data in this browser, so they survive a page refresh.
// Storage can be blocked (private mode, settings), so every call is protected.

export function loadState(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveState(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // If saving fails, the app still works; the data is just not kept after a refresh.
  }
}
