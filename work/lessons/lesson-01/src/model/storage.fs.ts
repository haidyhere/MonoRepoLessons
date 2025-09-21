import { promises as fs } from "fs";
import type { AppState } from "./types.ts";
import * as path from "path"; 

const DIR = path.join(process.env.HOME || ".", ".blessed-todo");
const FILE = path.join(DIR, "todos.json");

async function ensureDir() {
  await fs.mkdir(DIR, { recursive: true });
}

export async function loadState(): Promise<AppState | null> {
  try {
    await ensureDir();
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}
export async function saveState(state: AppState): Promise<void> {
  try {
    await ensureDir();
    const tmp = FILE + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf-8");
    await fs.rename(tmp, FILE); // 原子写
  } catch (err) {
    console.error("Failed to save state:", err);
  }
}

