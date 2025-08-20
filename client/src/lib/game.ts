import type { GameState, Pigment, RGB, SessionStats, MatchResult, MatchHistory } from "@shared/schema";
import { rgbToOKLab, mixColorsOKLab, okLabToRgb, calculateColorScore, rgbToHex, hexToRgb } from "./color";
import { nanoid } from "nanoid";

// Default pigments based on classic oil paint colors
// Function to convert hex to proper OKLab colorant values
function createPigment(id: string, name: string, code: string, swatchHex: string): Pigment {
  const rgb = hexToRgb(swatchHex);
  const colorant = rgbToOKLab(rgb);
  return { id, name, code, swatchHex, colorant };
}

export const DEFAULT_PIGMENTS: Pigment[] = [
  createPigment("pw6", "Titanium White", "PW6", "#F2F2F2"),
  createPigment("pbk9", "Ivory Black", "PBk9", "#1C1C1C"),
  createPigment("py35", "Cadmium Yellow", "PY35", "#F6C700"),
  createPigment("py43", "Yellow Ochre", "PY43", "#C49A2C"),
  createPigment("pr108", "Cadmium Red", "PR108", "#D02A2A"),
  createPigment("pr177", "Alizarin Crimson", "PR177", "#8E1F2E"),
  createPigment("pb29", "Ultramarine Blue", "PB29", "#2C3FA3"),
  createPigment("pb15", "Phthalo Blue", "PB15", "#0C4DA2"),
  createPigment("pg7", "Phthalo Green", "PG7", "#0C8A6D"),
  createPigment("pbr7", "Burnt Sienna", "PBr7", "#7A3B1C"),
];

// Predefined target colors with names
const TARGET_COLORS = [
  { name: "Burnt Sienna Tint", rgb: { r: 139, g: 90, b: 60 } },
  { name: "Sage Green", rgb: { r: 155, g: 173, b: 157 } },
  { name: "Dusty Rose", rgb: { r: 188, g: 143, b: 143 } },
  { name: "Warm Gray", rgb: { r: 128, g: 118, b: 105 } },
  { name: "Muted Purple", rgb: { r: 108, g: 91, b: 123 } },
  { name: "Olive Drab", rgb: { r: 107, g: 142, b: 35 } },
  { name: "Coral Pink", rgb: { r: 255, g: 127, b: 80 } },
  { name: "Steel Blue", rgb: { r: 70, g: 130, b: 180 } },
  { name: "Terracotta", rgb: { r: 204, g: 78, b: 92 } },
  { name: "Forest Shadow", rgb: { r: 85, g: 107, b: 47 } },
];

export function createInitialGameState(): GameState {
  const target = generateRandomTarget();
  
  return {
    target: target.rgb,
    targetName: target.name,
    strokes: [],
    amounts: {},
    totalAmount: 0,
    mixed: null,
    phase: "painting",
    score: null,
    activePigmentId: "py35", // Default to Cadmium Yellow
    brushSize: 16,
  };
}

export function generateRandomTarget(): { rgb: RGB; name: string } {
  const randomIndex = Math.floor(Math.random() * TARGET_COLORS.length);
  return TARGET_COLORS[randomIndex];
}

export function updateGameState(
  state: GameState,
  update: Partial<GameState>
): GameState {
  return { ...state, ...update };
}

export function addStrokeToGame(state: GameState, stroke: any): GameState {
  const newStrokes = [...state.strokes, stroke];
  const newAmounts = { ...state.amounts };
  newAmounts[stroke.pigmentId] = (newAmounts[stroke.pigmentId] || 0) + stroke.amount;
  
  const newTotalAmount = Object.values(newAmounts).reduce((sum, amount) => sum + amount, 0);
  
  return {
    ...state,
    strokes: newStrokes,
    amounts: newAmounts,
    totalAmount: newTotalAmount,
  };
}

export function removeLastStroke(state: GameState): GameState {
  if (state.strokes.length === 0) return state;
  
  const lastStroke = state.strokes[state.strokes.length - 1];
  const newStrokes = state.strokes.slice(0, -1);
  const newAmounts = { ...state.amounts };
  
  newAmounts[lastStroke.pigmentId] = Math.max(0, newAmounts[lastStroke.pigmentId] - lastStroke.amount);
  if (newAmounts[lastStroke.pigmentId] === 0) {
    delete newAmounts[lastStroke.pigmentId];
  }
  
  const newTotalAmount = Object.values(newAmounts).reduce((sum, amount) => sum + amount, 0);
  
  return {
    ...state,
    strokes: newStrokes,
    amounts: newAmounts,
    totalAmount: newTotalAmount,
  };
}

export function clearGameCanvas(state: GameState): GameState {
  return {
    ...state,
    strokes: [],
    amounts: {},
    totalAmount: 0,
    mixed: null,
    phase: "painting",
    score: null,
  };
}

export function mixColors(state: GameState, pigments: Pigment[]): GameState {
  if (state.totalAmount === 0) return state;
  
  const pigmentMap = new Map(pigments.map(p => [p.id, p]));
  const colorsToMix = Object.entries(state.amounts).map(([pigmentId, amount]) => {
    const pigment = pigmentMap.get(pigmentId);
    if (!pigment) throw new Error(`Pigment not found: ${pigmentId}`);
    
    return {
      color: pigment.colorant,
      weight: amount,
    };
  });
  
  const mixedOKLab = mixColorsOKLab(colorsToMix);
  const mixedRgb = okLabToRgb(mixedOKLab);
  const { score, deltaE } = calculateColorScore(state.target, mixedRgb);
  
  return {
    ...state,
    mixed: mixedRgb,
    phase: "mixed",
    score,
    // Keep canvas in painting mode so user can continue adding paint
  };
}

export function createDefaultSessionStats(): SessionStats {
  return {
    attempts: 0,
    totalScore: 0,
    averageScore: 0,
    bestScore: 0,
    gamesPlayed: 0,
  };
}

export function updateSessionStats(
  stats: SessionStats,
  score: number
): SessionStats {
  const newAttempts = stats.attempts + 1;
  const newTotalScore = stats.totalScore + score;
  const newAverageScore = Math.round(newTotalScore / newAttempts);
  const newBestScore = Math.max(stats.bestScore, score);
  
  return {
    attempts: newAttempts,
    totalScore: newTotalScore,
    averageScore: newAverageScore,
    bestScore: newBestScore,
    gamesPlayed: stats.gamesPlayed + 1,
  };
}

export function createMatchResult(
  state: GameState,
  deltaE: number
): MatchResult {
  if (!state.mixed || state.score === null) {
    throw new Error("Cannot create match result without mixed color and score");
  }
  
  return {
    id: nanoid(),
    targetColor: state.target,
    targetName: state.targetName,
    mixedColor: state.mixed,
    score: state.score,
    deltaE,
    timestamp: Date.now(),
    pigmentsUsed: { ...state.amounts },
  };
}

export function addMatchToHistory(
  history: MatchHistory,
  match: MatchResult
): MatchHistory {
  const newMatches = [match, ...history.matches].slice(0, 10); // Keep last 10 matches
  return { matches: newMatches };
}

export function getScoreCategory(score: number): string {
  if (score >= 95) return "Perfect!";
  if (score >= 85) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Close";
  return "Try Again";
}

export function getScoreColor(score: number): string {
  if (score >= 85) return "#10B981"; // Green
  if (score >= 70) return "#F59E0B"; // Yellow
  if (score >= 50) return "#EF4444"; // Red
  return "#6B7280"; // Gray
}

export function calculatePileSize(totalAmount: number): number {
  const baseSize = 40;
  const scaleFactor = 8;
  return baseSize + scaleFactor * Math.sqrt(totalAmount);
}
