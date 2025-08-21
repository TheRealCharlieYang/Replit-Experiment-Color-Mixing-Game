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
    colorant: { L: 0.88, a: -0.05, b: 0.25 }, // Bright yellow with proper green mixing
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
    colorant: { L: 0.42, a: 0.02, b: -0.30 }, // Classic blue with proper green mixing
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

// Predefined target colors with names and painter's notes
const TARGET_COLORS = [
  { name: "Naples Yellow", rgb: { r: 244, g: 224, b: 163 }, note: "Buttery, opaque sunshine for skin highlights and warm light." },
  { name: "Lemon Yellow", rgb: { r: 255, g: 244, b: 79 }, note: "Crisp cool yellow that snaps greens to life in daylight glazes." },
  { name: "Indian Yellow", rgb: { r: 255, g: 176, b: 0 }, note: "Golden, transparent glow—the glaze that makes sunsets breathe." },
  { name: "Hansa Yellow Medium", rgb: { r: 247, g: 208, b: 56 }, note: "Clean workhorse yellow for high-chroma mixes without mud." },
  { name: "Bismuth Yellow", rgb: { r: 249, g: 224, b: 76 }, note: "Bright, nontoxic cadmium stand-in for sparkling highlights." },
  { name: "Cadmium Orange", rgb: { r: 255, g: 127, b: 42 }, note: "Opaque blaze for fiery clouds and late-afternoon masonry." },
  { name: "Raw Sienna", rgb: { r: 192, g: 138, b: 62 }, note: "Earthy foundation—tone your canvas and warm every midtone." },
  { name: "Raw Umber", rgb: { r: 107, g: 78, b: 46 }, note: "Fast-drying neutralizer; the underpainting's best friend." },
  { name: "Burnt Umber", rgb: { r: 126, g: 74, b: 37 }, note: "Chocolate shadows that deepen portraits and woodgrain." },
  { name: "Permanent Rose", rgb: { r: 224, g: 60, b: 138 }, note: "An unfading flower, for Jenny." },
  { name: "Van Dyke Brown", rgb: { r: 90, g: 58, b: 43 }, note: "Smoky, old-master depth for velvet darks." },
  { name: "Transparent Oxide Red", rgb: { r: 163, g: 66, b: 34 }, note: "A ruby glaze that ignites landscapes without weight." },
  { name: "English Red (Light Red)", rgb: { r: 178, g: 76, b: 43 }, note: "Terracotta warmth that anchors flesh and brick." },
  { name: "Indian Red", rgb: { r: 126, g: 42, b: 42 }, note: "Dense iron warmth—steadies complexions and ancient walls." },
  { name: "Venetian Red", rgb: { r: 158, g: 58, b: 43 }, note: "Renaissance brick—classic cheeks, cloaks, and rooftops." },
  { name: "Vermilion", rgb: { r: 227, g: 66, b: 52 }, note: "Imperial warmth—beats like a pulse under skin and silk." },
  { name: "Scarlet Lake", rgb: { r: 255, g: 36, b: 0 }, note: "FIRE! The quick accent that commands attention." },
  { name: "Carmine", rgb: { r: 165, g: 0, b: 52 }, note: "Velvet theatre red for drapery and crimson twilight." },
  { name: "Quinacridone Red", rgb: { r: 209, g: 44, b: 79 }, note: "Transparent punch that glows through layered passages." },
  { name: "Quinacridone Rose", rgb: { r: 217, g: 90, b: 143 }, note: "Cool bloom—petals, dawn clouds, and romantic glazes." },
  { name: "Rose Madder (Hue)", rgb: { r: 227, g: 161, b: 184 }, note: "Victorian rose—delicate glazes with nostalgic softness." },
  { name: "Cobalt Violet Light", rgb: { r: 169, g: 138, b: 197 }, note: "Whispered lilac for atmospheric distance and skin cools." },
  { name: "Cobalt Violet Deep", rgb: { r: 119, g: 76, b: 158 }, note: "Mineral royalty deepens evening shadows with restraint." },
  { name: "Dioxazine Purple", rgb: { r: 74, g: 44, b: 111 }, note: "Electric violet—one drop turns twilight dramatic." },
  { name: "Mauve", rgb: { r: 177, g: 144, b: 182 }, note: "Powdery haze that softens horizons and quiets form." },
  { name: "Mars Violet (Caput Mortuum)", rgb: { r: 94, g: 45, b: 58 }, note: "Ancient wine—a solemn shadow for robes and rock." },
  { name: "Lavender", rgb: { r: 201, g: 182, b: 228 }, note: "Misty veil; Monet's air in a tube." },
  { name: "Cobalt Blue", rgb: { r: 58, g: 93, b: 174 }, note: "Breezy mineral blue for honest daylight skies." },
  { name: "Cerulean Blue", rgb: { r: 42, g: 127, b: 186 }, note: "Milky, granulating sky tone; instant sea air." },
  { name: "Manganese Blue Hue", rgb: { r: 58, g: 166, b: 222 }, note: "Luminous water sparkle and high-key skies." },
  { name: "Prussian Blue", rgb: { r: 11, g: 60, b: 93 }, note: "Inky depth that builds forests and night seas." },
  { name: "Indigo", rgb: { r: 38, g: 69, b: 125 }, note: "Storm-borne twilight for brooding glazes." },
  { name: "King's Blue", rgb: { r: 143, g: 185, b: 230 }, note: "Historical sky mix—white-kissed blue for porcelain light." },
  { name: "Azure", rgb: { r: 0, g: 127, b: 255 }, note: "High-noon clarity; the clean edge of summer." },
  { name: "Cobalt Turquoise", rgb: { r: 47, g: 184, b: 182 }, note: "Glass-sea brilliance for sunlit shallows." },
  { name: "Cobalt Teal", rgb: { r: 52, g: 198, b: 182 }, note: "Minted surf that cools skin and stone." },
  { name: "Viridian", rgb: { r: 27, g: 138, b: 107 }, note: "Transparent, cool green for crystalline shadows." },
  { name: "Phthalo Turquoise", rgb: { r: 0, g: 109, b: 119 }, note: "Petrol depth—oceans, beetle shells, and steel reflections." },
  { name: "Sap Green", rgb: { r: 80, g: 125, b: 42 }, note: "Leafy workhorse—mixable greens that feel lived-in." },
  { name: "Hooker's Green", rgb: { r: 59, g: 110, b: 59 }, note: "Victorian landscape staple for hedges and pine." },
  { name: "Chromium Oxide Green", rgb: { r: 79, g: 125, b: 74 }, note: "Opaque moss; the secret to believable foliage." },
  { name: "Terre Verte", rgb: { r: 123, g: 160, b: 91 }, note: "Classical green underpainting for luminous flesh." },
  { name: "Olive Green", rgb: { r: 107, g: 142, b: 35 }, note: "Dusty, sun-baked leaves and Mediterranean shadow." },
  { name: "Cobalt Green", rgb: { r: 111, g: 191, b: 155 }, note: "Pale mineral green for distance and air." },
  { name: "Emerald Green (modern)", rgb: { r: 0, g: 167, b: 118 }, note: "Safer emerald sparkle for accents and fairy light." },
  { name: "Permanent Green Light", rgb: { r: 116, g: 208, b: 85 }, note: "Spring shoots and fresh highlights—zing without chalk." },
  { name: "Payne's Gray", rgb: { r: 83, g: 96, b: 107 }, note: "Elegant blue-gray that replaces black in skies and steel." },
  { name: "Neutral Gray", rgb: { r: 128, g: 128, b: 128 }, note: "Value control—calms chroma without steering hue." },
  { name: "Davy's Gray", rgb: { r: 94, g: 110, b: 102 }, note: "Moody, mist-ready green-gray for rain and stone." },
  { name: "Buff Titanium", rgb: { r: 218, g: 210, b: 198 }, note: "Unbleached warmth; bone, parchment, and beach sand." },
];

export function createInitialGameState(): GameState {
  const target = generateRandomTarget();
  
  return {
    target: target.rgb,
    targetName: target.name,
    targetNote: target.note,
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

export function generateRandomTarget(): { rgb: RGB; name: string; note: string } {
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
