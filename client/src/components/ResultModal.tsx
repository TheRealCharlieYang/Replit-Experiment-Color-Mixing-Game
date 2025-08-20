import React from "react";
import type { RGB } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { rgbToHex, calculateColorScore } from "../lib/color";
import { getScoreCategory } from "../lib/game";
import { Palette, RotateCcw, Play, PaintBucket } from "lucide-react";

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetColor: RGB;
  targetName: string;
  mixedColor: RGB;
  score: number;
  onTryAgain: () => void;
  onNextTarget: () => void;
  onContinueMixing?: () => void;
}

export function ResultModal({
  isOpen,
  onClose,
  targetColor,
  targetName,
  mixedColor,
  score,
  onTryAgain,
  onNextTarget,
  onContinueMixing,
}: ResultModalProps) {
  const targetHex = rgbToHex(targetColor);
  const mixedHex = rgbToHex(mixedColor);
  const { deltaE } = calculateColorScore(targetColor, mixedColor);
  const scoreCategory = getScoreCategory(score);

  const getScoreIcon = () => {
    if (score >= 95) return "🎯";
    if (score >= 85) return "⭐";
    if (score >= 75) return "👍";
    if (score >= 60) return "👌";
    return "🎨";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 bg-white rounded-xl shadow-2xl" data-testid="result-modal">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <Palette className="w-8 h-8 text-green-600" />
          </div>
          
          <DialogTitle className="text-xl font-bold text-warm-gray-900 mb-2">
            Color Mixed! {getScoreIcon()}
          </DialogTitle>
          <p className="text-warm-gray-600 mb-6">
            Here's how close you got to the target
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Color Comparison */}
          <div className="flex space-x-4">
            <div className="flex-1 text-center">
              <div
                className="w-20 h-20 mx-auto rounded-lg border border-warm-gray-200 mb-2"
                style={{ backgroundColor: targetHex }}
                data-testid="comparison-target-color"
              />
              <span className="text-sm text-warm-gray-600">Target</span>
              <div className="text-xs text-warm-gray-500 font-mono mt-1">{targetName}</div>
            </div>
            <div className="flex-1 text-center">
              <div
                className="w-20 h-20 mx-auto rounded-lg border border-warm-gray-200 mb-2"
                style={{ backgroundColor: mixedHex }}
                data-testid="comparison-mixed-color"
              />
              <span className="text-sm text-warm-gray-600">Your Mix</span>
              <div className="text-xs text-warm-gray-500 font-mono mt-1">{mixedHex}</div>
            </div>
          </div>

          {/* Score Display */}
          <div className="bg-warm-gray-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-warm-gray-900 mb-1" data-testid="text-final-score">
                {score}
              </div>
              <div className="text-sm text-warm-gray-600">Color Accuracy Score</div>
              <div className="text-lg font-medium text-blue-600 mt-1">
                {scoreCategory}
              </div>
              <div className="text-xs text-warm-gray-500 mt-2">
                ΔE2000: <span data-testid="text-delta-e">{deltaE.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {onContinueMixing && (
              <Button
                onClick={onContinueMixing}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                data-testid="button-continue-mixing"
              >
                <PaintBucket className="w-4 h-4 mr-2" />
                Continue Adding More Paint
              </Button>
            )}
            <Button
              onClick={onTryAgain}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              data-testid="button-try-again"
            >
              <Play className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={onNextTarget}
              variant="outline"
              className="w-full bg-warm-gray-200 hover:bg-warm-gray-300 text-warm-gray-700 font-medium"
              data-testid="button-next-target"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Next Target
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
