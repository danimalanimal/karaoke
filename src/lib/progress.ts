import type { PlayerProgress } from "./types";

const STORAGE_KEY_PREFIX = "karaoke_progress_";

function getKey(player: string) {
  return `${STORAGE_KEY_PREFIX}${player}`;
}

export function loadProgress(player: string): PlayerProgress {
  if (typeof window === "undefined") {
    return createFresh(player);
  }
  const raw = localStorage.getItem(getKey(player));
  if (!raw) return createFresh(player);
  try {
    return JSON.parse(raw) as PlayerProgress;
  } catch {
    return createFresh(player);
  }
}

export function saveProgress(progress: PlayerProgress): void {
  progress.updatedAt = new Date().toISOString();
  localStorage.setItem(getKey(progress.player), JSON.stringify(progress));
}

export function resetProgress(player: string): void {
  localStorage.removeItem(getKey(player));
}

function createFresh(player: string): PlayerProgress {
  return {
    player,
    currentNode: "start",
    history: [],
    updatedAt: new Date().toISOString(),
  };
}
