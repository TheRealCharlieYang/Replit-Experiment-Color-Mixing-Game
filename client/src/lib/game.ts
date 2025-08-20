import type { GameState, Pigment, RGB, SessionStats, MatchResult, MatchHistory } from "@shared/schema";
import { rgbToOKLab, mixColorsOKLab, okLabToRgb, calculateColorScore, rgbToHex, hexToRgb } from "./color";
import { nanoid } from "nanoid";

// Default pigments with direct OKLab values to avoid conversion drift
export const DEFAULT_PIGMENTS: Pigment[] = [
  {
    id: "pw6",
    name: "Titanium White",
    code: "PW6",
    swatchHex: "#F2F2F2",
    colorant: { L: 0.96, a: 0.00, b: 0.00 }, // Pure white in OKLab
  },
  {
    id: "pbk9", 
    name: "Ivory Black",
    code: "PBk9",
    swatchHex: "#1C1C1C",
    colorant: { L: 0.15, a: 0.00, b: 0.00 }, // Pure black in OKLab
  },
  {
    id: "py35",
    name: "Cadmium Yellow", 
    code: "PY35",
    swatchHex: "#FFD200",
    colorant: { L: 0.88, a: 0.02, b: 0.18 }, // Bright yellow
  },
  {
    id: "py43",
    name: "Yellow Ochre",
    code: "PY43", 
    swatchHex: "#C6862B",
    colorant: { L: 0.62, a: 0.05, b: 0.12 }, // Earthy yellow
  },
  {
    id: "pr108",
    name: "Cadmium Red",
    code: "PR108",
    swatchHex: "#E03C31", 
    colorant: { L: 0.55, a: 0.22, b: 0.14 }, // Bright red
  },
  {
    id: "pr177",
    name: "Alizarin Crimson",
    code: "PR177",
    swatchHex: "#8A2232",
    colorant: { L: 0.32, a: 0.18, b: 0.08 }, // Deep crimson
  },
  {
    id: "pb29",
    name: "Ultramarine Blue",
    code: "PB29", 
    swatchHex: "#3F4BA0",
    colorant: { L: 0.42, a: 0.08, b: -0.25 }, // Classic blue
  },
  {
    id: "pb15",
    name: "Phthalo Blue",
    code: "PB15",
    swatchHex: "#0F4C81",
    colorant: { L: 0.35, a: -0.02, b: -0.22 }, // Deep blue
  },
  {
    id: "pg7", 
    name: "Phthalo Green",
    code: "PG7",
    swatchHex: "#00836C",
    colorant: { L: 0.48, a: -0.15, b: 0.05 }, // Blue-green
  },
  {
    id: "pbr7",
    name: "Burnt Sienna", 
    code: "PBr7",
    swatchHex: "#8A3B12",
    colorant: { L: 0.35, a: 0.12, b: 0.08 }, // Rich brown
  },
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
    phase: "review", // Change to review phase to show continue option
    score,
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
