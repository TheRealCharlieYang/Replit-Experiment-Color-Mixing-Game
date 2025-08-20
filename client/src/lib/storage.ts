import { SessionStats } from "@shared/schema";

const STORAGE_KEY = 'color-mix-game-stats';

export function loadSessionStats(): SessionStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load session stats:', error);
  }
  
  // Return default stats if none found or error occurred
  return {
    attempts: 0,
    totalScore: 0,
    averageScore: 0,
    bestScore: 0,
    gamesPlayed: 0,
  };
}

export function saveSessionStats(stats: SessionStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save session stats:', error);
  }
}

export function clearSessionStats(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear session stats:', error);
  }
}
