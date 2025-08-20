import { z } from "zod";

// Core color types
export const RGBSchema = z.object({
  r: z.number().min(0).max(255),
  g: z.number().min(0).max(255),
  b: z.number().min(0).max(255),
});

export const LabSchema = z.object({
  L: z.number(),
  a: z.number(),
  b: z.number(),
});

export const OKLabSchema = z.object({
  L: z.number(),
  a: z.number(),
  b: z.number(),
});

// Pigment definition
export const PigmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  swatchHex: z.string(),
  colorant: OKLabSchema,
});

// Stroke data
export const StrokePointSchema = z.object({
  x: z.number(),
  y: z.number(),
  t: z.number(),
  pressure: z.number().optional(),
});

export const StrokeSchema = z.object({
  id: z.string(),
  pigmentId: z.string(),
  points: z.array(StrokePointSchema),
  brushRadius: z.number(),
  length: z.number(),
  amount: z.number(),
});

// Game state
export const GameStateSchema = z.object({
  target: RGBSchema,
  targetName: z.string(),
  strokes: z.array(StrokeSchema),
  amounts: z.record(z.string(), z.number()),
  totalAmount: z.number(),
  mixed: RGBSchema.nullable(),
  phase: z.enum(['painting', 'mixed', 'review']),
  score: z.number().nullable(),
  activePigmentId: z.string(),
  brushSize: z.number(),
});

// Session stats
export const SessionStatsSchema = z.object({
  attempts: z.number(),
  totalScore: z.number(),
  averageScore: z.number(),
  bestScore: z.number(),
  gamesPlayed: z.number(),
});

// Match history
export const MatchResultSchema = z.object({
  id: z.string(),
  targetColor: RGBSchema,
  targetName: z.string(),
  mixedColor: RGBSchema,
  score: z.number(),
  deltaE: z.number(),
  timestamp: z.number(),
  pigmentsUsed: z.record(z.string(), z.number()),
});

export const MatchHistorySchema = z.object({
  matches: z.array(MatchResultSchema),
});

// Type exports
export type RGB = z.infer<typeof RGBSchema>;
export type Lab = z.infer<typeof LabSchema>;
export type OKLab = z.infer<typeof OKLabSchema>;
export type Pigment = z.infer<typeof PigmentSchema>;
export type Stroke = z.infer<typeof StrokeSchema>;
export type StrokePoint = z.infer<typeof StrokePointSchema>;
export type GameState = z.infer<typeof GameStateSchema>;
export type SessionStats = z.infer<typeof SessionStatsSchema>;
export type MatchResult = z.infer<typeof MatchResultSchema>;
export type MatchHistory = z.infer<typeof MatchHistorySchema>;
