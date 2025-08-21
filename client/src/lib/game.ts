import type { GameState, Pigment, RGB, SessionStats, MatchResult, MatchHistory } from "@shared/schema";
import { rgbToOKLab, mixColorsOKLab, okLabToRgb, calculateColorScore, rgbToHex, hexToRgb } from "./color";
import { nanoid } from "nanoid";
import { EXPANDED_PIGMENTS } from "./expanded-pigments";

// Use the expanded pigment palette
export const DEFAULT_PIGMENTS: Pigment[] = EXPANDED_PIGMENTS;

// Expanded target colors for more challenging mixing scenarios
const TARGET_COLORS = [
  // Earth Tones
  { name: "Burnt Sienna Tint", rgb: { r: 139, g: 90, b: 60 } },
  { name: "Raw Umber Shadow", rgb: { r: 89, g: 67, b: 52 } },
  { name: "Terracotta", rgb: { r: 204, g: 78, b: 92 } },
  { name: "Warm Ochre", rgb: { r: 183, g: 142, b: 89 } },
  { name: "Sienna Rose", rgb: { r: 156, g: 102, b: 89 } },
  
  // Greens
  { name: "Sage Green", rgb: { r: 155, g: 173, b: 157 } },
  { name: "Forest Shadow", rgb: { r: 85, g: 107, b: 47 } },
  { name: "Olive Drab", rgb: { r: 107, g: 142, b: 35 } },
  { name: "Viridian Tint", rgb: { r: 102, g: 156, b: 139 } },
  { name: "Spring Moss", rgb: { r: 134, g: 168, b: 102 } },
  { name: "Pine Shadow", rgb: { r: 67, g: 89, b: 72 } },
  
  // Blues
  { name: "Steel Blue", rgb: { r: 70, g: 130, b: 180 } },
  { name: "Prussian Tint", rgb: { r: 89, g: 134, b: 156 } },
  { name: "Cerulean Gray", rgb: { r: 112, g: 145, b: 167 } },
  { name: "Cobalt Shadow", rgb: { r: 67, g: 89, b: 134 } },
  { name: "Twilight Blue", rgb: { r: 89, g: 102, b: 145 } },
  
  // Purples and Violets
  { name: "Muted Purple", rgb: { r: 108, g: 91, b: 123 } },
  { name: "Lavender Gray", rgb: { r: 145, g: 134, b: 156 } },
  { name: "Violet Shadow", rgb: { r: 89, g: 72, b: 102 } },
  { name: "Mauve Mist", rgb: { r: 167, g: 145, b: 178 } },
  
  // Warm Colors
  { name: "Coral Pink", rgb: { r: 255, g: 127, b: 80 } },
  { name: "Dusty Rose", rgb: { r: 188, g: 143, b: 143 } },
  { name: "Peach Shadow", rgb: { r: 201, g: 156, b: 134 } },
  { name: "Salmon Tint", rgb: { r: 223, g: 167, b: 145 } },
  { name: "Venetian Rose", rgb: { r: 178, g: 123, b: 112 } },
  
  // Neutrals and Grays
  { name: "Warm Gray", rgb: { r: 128, g: 118, b: 105 } },
  { name: "Cool Gray", rgb: { r: 112, g: 123, b: 134 } },
  { name: "Payne's Tint", rgb: { r: 134, g: 145, b: 156 } },
  { name: "Charcoal Warm", rgb: { r: 89, g: 85, b: 78 } },
  { name: "Pearl Gray", rgb: { r: 167, g: 167, b: 162 } },
  
  // Complex Mixes
  { name: "Autumn Leaf", rgb: { r: 178, g: 134, b: 89 } },
  { name: "Desert Sand", rgb: { r: 201, g: 178, b: 134 } },
  { name: "Storm Cloud", rgb: { r: 102, g: 112, b: 123 } },
  { name: "Weathered Copper", rgb: { r: 134, g: 112, b: 89 } },
  { name: "Moonstone", rgb: { r: 156, g: 162, b: 167 } },
  { name: "Driftwood", rgb: { r: 145, g: 134, b: 123 } },
  { name: "Sea Foam", rgb: { r: 145, g: 167, b: 156 } },
  { name: "Canyon Red", rgb: { r: 167, g: 102, b: 89 } },
  { name: "Misty Morning", rgb: { r: 178, g: 183, b: 178 } },
  { name: "Golden Hour", rgb: { r: 201, g: 167, b: 112 } },
  { name: "Twilight Mist", rgb: { r: 134, g: 134, b: 145 } },
  { name: "Copper Patina", rgb: { r: 112, g: 134, b: 123 } },
  { name: "Dusty Lavender", rgb: { r: 156, g: 145, b: 162 } },
  { name: "Sage Shadow", rgb: { r: 123, g: 134, b: 123 } },
  { name: "Warm Stone", rgb: { r: 162, g: 156, b: 145 } },
  { name: "Cool Stone", rgb: { r: 145, g: 150, b: 156 } },
  { name: "Antique Gold", rgb: { r: 183, g: 167, b: 134 } },
  { name: "Faded Rose", rgb: { r: 167, g: 134, b: 145 } },
  { name: "Moss Stone", rgb: { r: 134, g: 145, b: 134 } },
  { name: "Pewter", rgb: { r: 145, g: 145, b: 150 } },
  { name: "Sandstone", rgb: { r: 178, g: 162, b: 145 } }
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
    brushSize: 32, // Double the previous default (16 * 2)
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
    phase: "painting", // Keep in painting phase to allow continuous painting
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
