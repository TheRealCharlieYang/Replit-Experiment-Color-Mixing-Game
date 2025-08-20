import { useState } from "react";
import { TargetPanel } from "./TargetPanel";
import { PaintCanvas } from "./PaintCanvas";
import { ToolPanel } from "./ToolPanel";
import { ResultModal } from "./ResultModal";
import { useGameState } from "@/hooks/useGameState";

export default function GameLayout() {
  const {
    gameState,
    selectedPigment,
    brushSize,
    selectPigment,
    setBrushSize,
    addStroke,
    undoStroke,
    clearCanvas,
    mixColors,
    generateNewTarget,
    tryAgain,
    sessionStats
  } = useGameState();

  const [showResultModal, setShowResultModal] = useState(false);

  const handleMixColors = () => {
    mixColors();
    setShowResultModal(true);
  };

  const handleTryAgain = () => {
    setShowResultModal(false);
    tryAgain();
  };

  const handleNextTarget = () => {
    setShowResultModal(false);
    generateNewTarget();
  };

  return (
    <div className="bg-warm-gray-50 text-warm-gray-800 overflow-hidden">
      <div className="flex h-screen">
        <TargetPanel 
          gameState={gameState}
          sessionStats={sessionStats}
          onGenerateNewTarget={generateNewTarget}
        />
        
        <PaintCanvas
          gameState={gameState}
          selectedPigment={selectedPigment}
          brushSize={brushSize}
          onAddStroke={addStroke}
        />
        
        <ToolPanel
          gameState={gameState}
          selectedPigment={selectedPigment}
          brushSize={brushSize}
          onSelectPigment={selectPigment}
          onSetBrushSize={setBrushSize}
          onMixColors={handleMixColors}
          onUndoStroke={undoStroke}
          onClearCanvas={clearCanvas}
        />
      </div>

      <ResultModal
        isOpen={showResultModal}
        gameState={gameState}
        onTryAgain={handleTryAgain}
        onNextTarget={handleNextTarget}
      />
    </div>
  );
}
