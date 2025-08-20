import { useRef, useEffect, useState } from "react";
import { GameState, Pigment } from "@shared/schema";
import { Stroke } from "@shared/schema";
import { rgbToHex } from "@/lib/color";
import { renderStrokes, renderMixedPile } from "@/lib/paint";

interface PaintCanvasProps {
  gameState: GameState;
  selectedPigment: Pigment | null;
  brushSize: number;
  onAddStroke: (stroke: Stroke) => void;
}

export default function PaintCanvas({ gameState, selectedPigment, brushSize, onAddStroke }: PaintCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const brushPreviewRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ points: { x: number; y: number; t: number }[] } | null>(null);

  // Update canvas when strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Always render all strokes - no mixed pile display
    renderStrokes(ctx, gameState.strokes);
  }, [gameState.strokes, gameState.phase, gameState.mixed, gameState.totalAmount]);

  // Handle mouse/pointer events
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!selectedPigment) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentStroke({
      points: [{ x, y, t: Date.now() }]
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    const brushPreview = brushPreviewRef.current;
    if (!canvas || !brushPreview) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update brush preview
    brushPreview.style.left = `${e.clientX}px`;
    brushPreview.style.top = `${e.clientY}px`;
    brushPreview.style.width = `${brushSize}px`;
    brushPreview.style.height = `${brushSize}px`;
    brushPreview.style.display = 'block';
    
    if (selectedPigment) {
      brushPreview.style.backgroundColor = selectedPigment.swatchHex + '40';
      brushPreview.style.borderColor = selectedPigment.swatchHex;
    }

    // Continue stroke if drawing
    if (isDrawing && currentStroke && selectedPigment) {
      const newPoint = { x, y, t: Date.now() };
      const updatedStroke = {
        ...currentStroke,
        points: [...currentStroke.points, newPoint]
      };
      setCurrentStroke(updatedStroke);

      // Draw current stroke in real-time
      const ctx = canvas.getContext('2d');
      if (ctx && currentStroke.points.length > 0) {
        const lastPoint = currentStroke.points[currentStroke.points.length - 1];
        ctx.strokeStyle = selectedPigment.swatchHex;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing || !currentStroke || !selectedPigment) return;
    
    setIsDrawing(false);
    
    // Calculate stroke length and create final stroke
    let length = 0;
    for (let i = 1; i < currentStroke.points.length; i++) {
      const prev = currentStroke.points[i - 1];
      const curr = currentStroke.points[i];
      length += Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
    }

    // Calculate amount based on brush size and length
    const densityFactor = 0.1;
    const scalePxToMl = 0.01;
    const amount = densityFactor * Math.PI * Math.pow(brushSize / 2, 2) * length * scalePxToMl;

    const finalStroke: Stroke = {
      id: Date.now().toString(),
      pigmentId: selectedPigment.id,
      points: currentStroke.points,
      brushRadius: brushSize / 2,
      length,
      amount
    };

    onAddStroke(finalStroke);
    setCurrentStroke(null);
  };

  const handlePointerLeave = () => {
    const brushPreview = brushPreviewRef.current;
    if (brushPreview) {
      brushPreview.style.display = 'none';
    }
    setIsDrawing(false);
    setCurrentStroke(null);
  };

  return (
    <main className="flex-1 p-6 flex flex-col">
      <div className="flex-1 canvas-container p-4 relative">
        <canvas 
          ref={canvasRef}
          id="paintCanvas" 
          width={800} 
          height={560}
          className="w-full h-full rounded-xl bg-white cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          data-testid="paint-canvas"
        />
        
        {/* Brush Preview Cursor */}
        <div 
          ref={brushPreviewRef}
          className="brush-preview border-2 border-dashed border-gray-400 rounded-full absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 hidden"
          data-testid="brush-preview"
        />
      </div>

      {/* Canvas Status Bar */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="flex items-center space-x-4 text-sm text-warm-gray-600">
          <span>
            Total Paint: <span className="font-medium" data-testid="total-paint-amount">
              {gameState.totalAmount.toFixed(1)} mL
            </span>
          </span>
          <span>
            Strokes: <span className="font-medium" data-testid="stroke-count">
              {gameState.strokes.length}
            </span>
          </span>
        </div>
        <div className="text-xs text-warm-gray-500">
          <span data-testid="canvas-status">
            Ready to paint
          </span>
        </div>
      </div>
    </main>
  );
}
