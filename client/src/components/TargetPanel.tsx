import React from "react";
import type { RGB, SessionStats } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { rgbToHex } from "../lib/color";
import { Palette, RotateCcw, Lightbulb } from "lucide-react";

interface TargetPanelProps {
  target: RGB;
  targetName: string;
  currentScore: number | null;
  sessionStats: SessionStats;
  onGenerateNewTarget: () => void;
  onShowHint?: () => void;
}

export function TargetPanel({
  target,
  targetName,
  currentScore,
  sessionStats,
  onGenerateNewTarget,
  onShowHint,
}: TargetPanelProps) {
  const targetHex = rgbToHex(target);
  const scorePercentage = currentScore || 0;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "#10B981";
    if (score >= 70) return "#F59E0B";
    if (score >= 50) return "#EF4444";
    return "#6B7280";
  };

  return (
    <aside className="w-80 bg-white border-r border-warm-gray-200 p-6 overflow-y-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-warm-gray-900 mb-2">
            Color Mix Challenge
          </h1>
          <p className="text-sm text-warm-gray-600 mb-6">
            Mix the pigments to match the target color
          </p>

          {/* Target Color Display */}
          <div className="relative mb-4">
            <div
              className="w-32 h-32 mx-auto rounded-xl shadow-lg target-shimmer relative overflow-hidden"
              style={{ backgroundColor: targetHex }}
              data-testid="target-color-display"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10" />
            </div>
            <div className="mt-3">
              <h3 className="font-semibold text-warm-gray-900" data-testid="target-name">
                {targetName}
              </h3>
              <p className="text-xs text-warm-gray-500 font-mono" data-testid="target-hex">
                {targetHex}
              </p>
            </div>
          </div>

          {/* Score Display */}
          <div className="bg-warm-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-warm-gray-700">Current Score</span>
              <span className="text-2xl font-bold text-warm-gray-900" data-testid="current-score">
                {currentScore !== null ? currentScore : "—"}
              </span>
            </div>
            <div
              className="score-ring w-16 h-16 mx-auto"
              style={{
                background: `conic-gradient(from 0deg, ${getScoreColor(scorePercentage)} 0deg ${
                  (scorePercentage / 100) * 360
                }deg, #E5E7EB ${(scorePercentage / 100) * 360}deg 360deg)`,
              }}
              data-testid="score-ring"
            >
              <div className="w-full h-full bg-warm-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-warm-gray-600">
                  {scorePercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="space-y-3">
            <Button
              onClick={onGenerateNewTarget}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              data-testid="button-new-target"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Target
            </Button>
            {onShowHint && (
              <Button
                onClick={onShowHint}
                variant="outline"
                className="w-full bg-warm-gray-200 hover:bg-warm-gray-300 text-warm-gray-700 font-medium"
                data-testid="button-hint"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Hint (-10 pts)
              </Button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="border-t border-warm-gray-200 pt-6">
          <h4 className="font-semibold text-warm-gray-900 mb-3 flex items-center">
            <Palette className="w-4 h-4 mr-2 text-blue-600" />
            Session Stats
          </h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-warm-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-warm-gray-900" data-testid="text-attempts">
                {sessionStats.attempts}
              </div>
              <div className="text-xs text-warm-gray-600">Attempts</div>
            </div>
            <div className="bg-warm-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-warm-gray-900" data-testid="text-average-score">
                {sessionStats.averageScore}
              </div>
              <div className="text-xs text-warm-gray-600">Avg Score</div>
            </div>
            <div className="bg-warm-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-warm-gray-900" data-testid="text-best-score">
                {sessionStats.bestScore}
              </div>
              <div className="text-xs text-warm-gray-600">Best Score</div>
            </div>
            <div className="bg-warm-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-warm-gray-900" data-testid="text-games-played">
                {sessionStats.gamesPlayed}
              </div>
              <div className="text-xs text-warm-gray-600">Games</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
