import type{ AppState } from "./types";

const KEY = "todos";

export async function loadState(): Promise<AppState | null> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
}