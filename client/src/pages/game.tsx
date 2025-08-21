import React, { useState, useEffect } from "react";
import { GameCanvas } from "../components/GameCanvas";
import { TargetPanel } from "../components/TargetPanel";
import { ToolPanel } from "../components/ToolPanel";
import { ResultModal } from "../components/ResultModal";
import { Fireworks } from "../components/Fireworks";
import { useGameState } from "../hooks/useGameState";
import { DEFAULT_PIGMENTS } from "../lib/game";

export default function GamePage() {
  const {
    gameState,
    sessionStats,
    matchHistory,
    addStroke,
    undoLastStroke,
    clearCanvas,
    mix,
    generateNewTarget,
    selectPigment,
    setBrushSize,
  } = useGameState();

  const [showResultModal, setShowResultModal] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [fireworksSpecial, setFireworksSpecial] = useState(false);
  const [permanentRoseTriggered, setPermanentRoseTriggered] = useState(false);

  // Trigger fireworks when score exceeds 90 or when Permanent Rose appears
  useEffect(() => {
    if (gameState.score && gameState.score > 90) {
      setShowFireworks(true);
      // Auto-hide fireworks after 3 seconds
      setTimeout(() => setShowFireworks(false), 3000);
    }
    
    if (gameState.targetName === "Permanent Rose" && !permanentRoseTriggered) {
      setPermanentRoseTriggered(true);
      setFireworksSpecial(true);
      setShowFireworks(true);
      // Auto-hide special fireworks after 5 seconds
      setTimeout(() => {
        setShowFireworks(false);
        setFireworksSpecial(false);
      }, 5000);
    }
  }, [gameState.score, gameState.targetName, permanentRoseTriggered]);

  const handleMixColors = () => {
    mix();
    setShowResultModal(true);
  };

  const handleTryAgain = () => {
    setShowResultModal(false);
    clearCanvas();
  };


  const handleNextTarget = () => {
    setShowResultModal(false);
    generateNewTarget();
  };

  const activePigment = DEFAULT_PIGMENTS.find(p => p.id === gameState.activePigmentId) || DEFAULT_PIGMENTS[0];

  return (
    <div className="flex h-screen bg-warm-gray-50 text-warm-gray-800 overflow-hidden">
      {/* Left Panel - Target & Scoring */}
      <TargetPanel
        target={gameState.target}
        targetName={gameState.targetName}
        targetNote={gameState.targetNote}
        currentScore={gameState.score}
        sessionStats={sessionStats}
        onGenerateNewTarget={generateNewTarget}
      />

      {/* Main Canvas Area */}
      <main className="flex-1 p-6 flex flex-col">
        <div className="flex-1">
          <GameCanvas
            strokes={gameState.strokes}
            activePigment={activePigment}
            brushSize={gameState.brushSize}
            phase={gameState.phase}
            mixedColor={gameState.mixed}
            totalAmount={gameState.totalAmount}
            onStrokeComplete={addStroke}
          />
        </div>

        {/* Canvas Status Bar */}
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="flex items-center space-x-4 text-sm text-warm-gray-600">
            <span>
              Strokes: <span className="font-medium" data-testid="status-stroke-count">
                {gameState.strokes.length}
              </span>
            </span>
          </div>
          <div className="text-xs text-warm-gray-500">
            <span data-testid="status-canvas-phase">
              {gameState.phase === "painting" ? "Ready to paint" : 
               gameState.phase === "mixed" ? "Colors mixed" : "Review mode"}
            </span>
          </div>
        </div>
      </main>

      {/* Right Panel - Tools & Pigments */}
      <ToolPanel
        pigments={DEFAULT_PIGMENTS}
        activePigmentId={gameState.activePigmentId}
        brushSize={gameState.brushSize}
        paintAmounts={gameState.amounts}
        totalAmount={gameState.totalAmount}
        strokeCount={gameState.strokes.length}
        canUndo={gameState.strokes.length > 0}
        onSelectPigment={selectPigment}
        onBrushSizeChange={setBrushSize}
        onMixColors={handleMixColors}
        onUndo={undoLastStroke}
        onClear={clearCanvas}
      />

      {/* Result Modal */}
      {gameState.mixed && (
        <ResultModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          targetColor={gameState.target}
          targetName={gameState.targetName}
          mixedColor={gameState.mixed}
          score={gameState.score || 0}
          onTryAgain={handleTryAgain}
          onNextTarget={handleNextTarget}
        />
      )}

      {/* Fireworks Effect */}
      <Fireworks trigger={showFireworks} isSpecial={fireworksSpecial} />
    </div>
  );
}
