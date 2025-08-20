import { type SessionStats, type MatchHistory } from "@shared/schema";

// Storage interface for the color mixing game
export interface IStorage {
  getSessionStats(): Promise<SessionStats>;
  updateSessionStats(stats: SessionStats): Promise<void>;
  getMatchHistory(): Promise<MatchHistory>;
  updateMatchHistory(history: MatchHistory): Promise<void>;
}

export class MemStorage implements IStorage {
  private sessionStats: SessionStats;
  private matchHistory: MatchHistory;

  constructor() {
    // Initialize with default values
    this.sessionStats = {
      attempts: 0,
      totalScore: 0,
      averageScore: 0,
      bestScore: 0,
      gamesPlayed: 0,
    };
    
    this.matchHistory = {
      matches: [],
    };
  }

  async getSessionStats(): Promise<SessionStats> {
    return { ...this.sessionStats };
  }

  async updateSessionStats(stats: SessionStats): Promise<void> {
    this.sessionStats = { ...stats };
  }

  async getMatchHistory(): Promise<MatchHistory> {
    return { 
      matches: [...this.matchHistory.matches] 
    };
  }

  async updateMatchHistory(history: MatchHistory): Promise<void> {
    this.matchHistory = { 
      matches: [...history.matches] 
    };
  }
}

export const storage = new MemStorage();
