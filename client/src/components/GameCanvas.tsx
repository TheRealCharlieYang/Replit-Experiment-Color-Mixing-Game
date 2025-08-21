import React, { useRef, useEffect, useState, useCallback } from "react";
import type { Pigment, Stroke } from "@shared/schema";
import { createPaintEngine, startStroke, continueStroke, endStroke, redrawAllStrokes, getPointerPosition, calculatePileSize, drawPaintSquirt } from "../lib/paint";
import { rgbToHex } from "../lib/color";

interface GameCanvasProps {
  strokes: Stroke[];
  activePigment: Pigment;
  brushSize: number;
  phase: "painting" | "mixed" | "review";
  mixedColor: { r: number; g: number; b: number } | null;
  totalAmount: number;
  onStrokeComplete: (stroke: Stroke) => void;
}

export function GameCanvas({
  strokes,
  activePigment,
  brushSize,
  phase,
  mixedColor,
  totalAmount,
  onStrokeComplete,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);
  const [brushPreview, setBrushPreview] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  // Initialize paint engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = createPaintEngine(canvas, activePigment);
    engine.brushSize = brushSize;
    engineRef.current = engine;

    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    engine.ctx.imageSmoothingEnabled = true;

    return () => {
      engineRef.current = null;
    };
  }, []);

  // Update active pigment and brush size
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.activePigment = activePigment;
      engineRef.current.brushSize = brushSize;
    }
  }, [activePigment, brushSize]);

  // Redraw strokes when they change
  useEffect(() => {
    if (engineRef.current) {
      // Import all pigments to ensure we can redraw all strokes
      import("../lib/game").then(({ DEFAULT_PIGMENTS }) => {
        redrawAllStrokes(engineRef.current, strokes, DEFAULT_PIGMENTS);
      });
    }
  }, [strokes]);

  // Handle pointer events
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    if (phase !== "painting" || !engineRef.current) return;

    const { x, y, pressure } = getPointerPosition(canvasRef.current!, event);
    
    // Ensure we have a clean start for the new stroke
    engineRef.current.isDrawing = false;
    engineRef.current.currentStroke = null;
    
    startStroke(engineRef.current, x, y, pressure);
    
    // Capture pointer for consistent events
    canvasRef.current?.setPointerCapture(event.pointerId);
  }, [phase]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!canvasRef.current) return;

    const { x, y, pressure } = getPointerPosition(canvasRef.current, event);
    
    // Update brush preview
    const rect = canvasRef.current.getBoundingClientRect();
    setBrushPreview({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      visible: true,
    });

    // Continue stroke if drawing
    if (phase === "painting" && engineRef.current?.isDrawing) {
      // Throttle pointer events for better performance
      const now = Date.now();
      if (!engineRef.current.lastMoveTime || now - engineRef.current.lastMoveTime > 8) {
        engineRef.current.lastMoveTime = now;
      continueStroke(engineRef.current, x, y, pressure);
      }
    }
  }, [phase]);

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    if (phase !== "painting" || !engineRef.current) return;

    const completedStroke = endStroke(engineRef.current);
    if (completedStroke) {
      onStrokeComplete(completedStroke);
    }
    
    // Release pointer capture
    canvasRef.current?.releasePointerCapture(event.pointerId);
  }, [phase, onStrokeComplete]);

  const handlePointerLeave = useCallback(() => {
    setBrushPreview(prev => ({ ...prev, visible: false }));
  }, []);

  // Render fixed-size mixed color pile in center
  const renderMixedPile = () => {
    if (!mixedColor) return null;

    const pileColor = rgbToHex(mixedColor);
    const pileSize = 80; // Fixed size

    return (
      <div
        className="absolute mixed-pile rounded-full shadow-lg border-2 border-white"
        style={{
          width: `${pileSize}px`,
          height: `${pileSize}px`,
          backgroundColor: pileColor,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)",
        }}
        data-testid="mixed-color-pile"
      />
    );
  };

  return (
    <div className="relative w-full h-full canvas-container bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-inner">
      <canvas
        ref={canvasRef}
        className="paint-canvas w-full h-full rounded-lg"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        style={{ touchAction: "none" }}
        data-testid="paint-canvas"
      />
      
      {/* Brush Preview */}
      {brushPreview.visible && phase === "painting" && (
        <div
          className="brush-preview"
          style={{
            left: `${brushPreview.x}px`,
            top: `${brushPreview.y}px`,
            width: `${brushSize}px`,
            height: `${brushSize}px`,
            backgroundColor: activePigment.swatchHex + "40", // 25% opacity
          }}
          data-testid="brush-preview"
        />
      )}
      
      {/* Mixed Color Pile */}
      {renderMixedPile()}
    </div>
  );
}
