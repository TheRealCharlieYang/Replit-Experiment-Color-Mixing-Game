import { useState, useCallback } from "react";
import type { GameState, Stroke, SessionStats, MatchHistory } from "@shared/schema";
import {
  createInitialGameState,
  updateGameState,
  addStrokeToGame,
  removeLastStroke,
  clearGameCanvas,
  mixColors,
  generateRandomTarget,
  createDefaultSessionStats,
  updateSessionStats,
  createMatchResult,
  addMatchToHistory,
  DEFAULT_PIGMENTS,
} from "../lib/game";
import { calculateColorScore } from "../lib/color";
import { useLocalStorage } from "./useLocalStorage";

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [sessionStats, setSessionStats] = useLocalStorage<SessionStats>(
    "colorMixGame_sessionStats",
    createDefaultSessionStats()
  );
  const [matchHistory, setMatchHistory] = useLocalStorage<MatchHistory>(
    "colorMixGame_matchHistory",
    { matches: [] }
  );

  const updateGame = useCallback((update: Partial<GameState>) => {
    setGameState(current => updateGameState(current, update));
  }, []);

  const addStroke = useCallback((stroke: Stroke) => {
    setGameState(current => addStrokeToGame(current, stroke));
  }, []);

  const undoLastStroke = useCallback(() => {
    setGameState(current => removeLastStroke(current));
  }, []);

  const clearCanvas = useCallback(() => {
    setGameState(current => clearGameCanvas(current));
  }, []);

  const mix = useCallback(() => {
    setGameState(current => {
      const mixedState = mixColors(current, DEFAULT_PIGMENTS);
      
      if (mixedState.mixed && mixedState.score !== null) {
        // Update session stats
        const newStats = updateSessionStats(sessionStats, mixedState.score);
        setSessionStats(newStats);
        
        // Add to match history
        const { deltaE } = calculateColorScore(current.target, mixedState.mixed);
        const matchResult = createMatchResult(mixedState, deltaE);
        const newHistory = addMatchToHistory(matchHistory, matchResult);
        setMatchHistory(newHistory);
      }
      
      return mixedState;
    });
  }, [sessionStats, setSessionStats, matchHistory, setMatchHistory]);

  const generateNewTarget = useCallback(() => {
    const target = generateRandomTarget();
    setGameState(current => ({
      ...clearGameCanvas(current),
      target: target.rgb,
      targetName: target.name,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
  }, []);

  const selectPigment = useCallback((pigmentId: string) => {
    updateGame({ activePigmentId: pigmentId });
  }, [updateGame]);

  const setBrushSize = useCallback((size: number) => {
    updateGame({ brushSize: size });
  }, [updateGame]);

  return {
    gameState,
    sessionStats,
    matchHistory,
    updateGame,
    addStroke,
    undoLastStroke,
    clearCanvas,
    mix,
    generateNewTarget,
    resetGame,
    selectPigment,
    setBrushSize,
  };
}
