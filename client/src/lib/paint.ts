import type { Stroke, StrokePoint, Pigment } from "@shared/schema";
import { nanoid } from "nanoid";

export interface PaintEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  isDrawing: boolean;
  currentStroke: Stroke | null;
  strokes: Stroke[];
  activePigment: Pigment;
  brushSize: number;
}

export function createPaintEngine(canvas: HTMLCanvasElement, pigment: Pigment): PaintEngine {
  const ctx = canvas.getContext('2d')!;
  
  return {
    canvas,
    ctx,
    isDrawing: false,
    currentStroke: null,
    strokes: [],
    activePigment: pigment,
    brushSize: 16,
  };
}

export function startStroke(
  engine: PaintEngine,
  x: number,
  y: number,
  pressure: number = 1
): void {
  engine.isDrawing = true;
  
  const startPoint: StrokePoint = {
    x,
    y,
    t: Date.now(),
    pressure,
  };
  
  engine.currentStroke = {
    id: nanoid(),
    pigmentId: engine.activePigment.id,
    points: [startPoint],
    brushRadius: engine.brushSize,
    length: 0,
    amount: 0,
  };
  
  // Draw initial paint squirt
  drawPaintSquirt(engine, x, y, pressure);
}

export function continueStroke(
  engine: PaintEngine,
  x: number,
  y: number,
  pressure: number = 1
): void {
  if (!engine.isDrawing || !engine.currentStroke) return;
  
  const newPoint: StrokePoint = {
    x,
    y,
    t: Date.now(),
    pressure,
  };
  
  const lastPoint = engine.currentStroke.points[engine.currentStroke.points.length - 1];
  
  // Calculate segment length and distance
  const segmentLength = Math.sqrt(
    Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2)
  );
  
  engine.currentStroke.points.push(newPoint);
  engine.currentStroke.length += segmentLength;
  
  // Draw continuous thick brush stroke with tapered ends
  drawThickBrushStroke(engine, lastPoint, newPoint);
}

export function endStroke(engine: PaintEngine): Stroke | null {
  if (!engine.isDrawing || !engine.currentStroke) return null;
  
  engine.isDrawing = false;
  
  // Calculate total paint amount for this stroke
  const averagePressure = engine.currentStroke.points.reduce((sum, p) => sum + (p.pressure || 1), 0) / engine.currentStroke.points.length;
  const densityFactor = 0.1; // Tune this for realistic amounts
  const scalePxToMl = 0.01; // Scale factor for pixel to mL conversion
  
  engine.currentStroke.amount = 
    densityFactor * 
    Math.PI * 
    Math.pow(engine.currentStroke.brushRadius, 2) * 
    engine.currentStroke.length * 
    averagePressure * 
    scalePxToMl;
  
  const completedStroke = { ...engine.currentStroke };
  engine.strokes.push(completedStroke);
  engine.currentStroke = null;
  
  return completedStroke;
}

function drawPoint(engine: PaintEngine, x: number, y: number, pressure: number): void {
  drawPaintSquirt(engine, x, y, pressure);
}

export function drawPaintSquirt(engine: PaintEngine, x: number, y: number, pressure: number): void {
  const baseRadius = engine.brushSize / 2;
  const paintAmount = baseRadius * pressure;
  
  engine.ctx.save();
  
  // Draw shadow first (offset slightly)
  engine.ctx.globalAlpha = 0.3;
  engine.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  engine.ctx.beginPath();
  engine.ctx.arc(x + 2, y + 2, paintAmount, 0, Math.PI * 2);
  engine.ctx.fill();
  
  // Draw main paint blob with 3D effect
  const gradient = engine.ctx.createRadialGradient(
    x - paintAmount * 0.3, y - paintAmount * 0.3, 0,
    x, y, paintAmount
  );
  
  // Parse hex color and create highlight/shadow variations
  const hex = engine.activePigment.swatchHex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  const highlight = `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`;
  const base = `rgb(${r}, ${g}, ${b})`;
  const shadow = `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`;
  
  gradient.addColorStop(0, highlight);
  gradient.addColorStop(0.6, base);
  gradient.addColorStop(1, shadow);
  
  engine.ctx.globalAlpha = 0.9;
  engine.ctx.fillStyle = gradient;
  engine.ctx.beginPath();
  engine.ctx.arc(x, y, paintAmount, 0, Math.PI * 2);
  engine.ctx.fill();
  
  engine.ctx.restore();
}

function drawLineSegment(engine: PaintEngine, from: StrokePoint, to: StrokePoint): void {
  const fromRadius = (engine.brushSize / 2) * (from.pressure || 1);
  const toRadius = (engine.brushSize / 2) * (to.pressure || 1);
  
  engine.ctx.save();
  engine.ctx.globalAlpha = 0.8;
  engine.ctx.fillStyle = engine.activePigment.swatchHex;
  
  // Draw line with varying width
  engine.ctx.beginPath();
  engine.ctx.moveTo(from.x, from.y);
  engine.ctx.lineTo(to.x, to.y);
  engine.ctx.lineWidth = Math.max(fromRadius, toRadius) * 2;
  engine.ctx.lineCap = 'round';
  engine.ctx.strokeStyle = engine.activePigment.swatchHex;
  engine.ctx.stroke();
  
  // Draw end cap
  engine.ctx.beginPath();
  engine.ctx.arc(to.x, to.y, toRadius, 0, Math.PI * 2);
  engine.ctx.fill();
  
  engine.ctx.restore();
}

function drawThickBrushStroke(engine: PaintEngine, from: StrokePoint, to: StrokePoint): void {
  const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  if (distance < 1) return; // Skip very short segments
  
  engine.ctx.save();
  
  // Create thick brush stroke with shadow
  const baseWidth = engine.brushSize;
  const fromPressure = from.pressure || 1;
  const toPressure = to.pressure || 1;
  
  // Draw shadow first
  engine.ctx.globalAlpha = 0.3;
  engine.ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
  engine.ctx.lineWidth = baseWidth * Math.max(fromPressure, toPressure);
  engine.ctx.lineCap = "round";
  engine.ctx.lineJoin = "round";
  engine.ctx.beginPath();
  engine.ctx.moveTo(from.x + 2, from.y + 2);
  engine.ctx.lineTo(to.x + 2, to.y + 2);
  engine.ctx.stroke();
  
  // Draw main stroke with gradient
  const gradient = engine.ctx.createLinearGradient(from.x, from.y, to.x, to.y);
  
  const hex = engine.activePigment.swatchHex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  const highlight = `rgba(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)}, 0.9)`;
  const base = `rgba(${r}, ${g}, ${b}, 0.85)`;
  
  gradient.addColorStop(0, highlight);
  gradient.addColorStop(0.5, base);
  gradient.addColorStop(1, highlight);
  
  engine.ctx.globalAlpha = 0.9;
  engine.ctx.strokeStyle = gradient;
  engine.ctx.lineWidth = baseWidth * fromPressure;
  engine.ctx.lineCap = "round";
  engine.ctx.lineJoin = "round";
  engine.ctx.beginPath();
  engine.ctx.moveTo(from.x, from.y);
  engine.ctx.lineTo(to.x, to.y);
  engine.ctx.stroke();
  
  engine.ctx.restore();
}

export function redrawAllStrokes(engine: PaintEngine, strokes: Stroke[], allPigments: Pigment[]): void {
  engine.ctx.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
  
  const pigmentMap = new Map(allPigments.map(p => [p.id, p]));
  
  strokes.forEach(stroke => {
    const pigment = pigmentMap.get(stroke.pigmentId);
    if (!pigment) return;
    
    const oldPigment = engine.activePigment;
    engine.activePigment = pigment;
    
    stroke.points.forEach((point, index) => {
      if (index === 0) {
        drawPaintSquirt(engine, point.x, point.y, point.pressure || 1);
      } else {
        drawThickBrushStroke(engine, stroke.points[index - 1], point);
      }
    });
    
    engine.activePigment = oldPigment;
  });
}

export function clearCanvas(engine: PaintEngine): void {
  engine.ctx.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
  engine.strokes = [];
  engine.currentStroke = null;
  engine.isDrawing = false;
}

export function getPointerPosition(
  canvas: HTMLCanvasElement,
  event: React.PointerEvent | React.MouseEvent
): { x: number; y: number; pressure: number } {
  const rect = canvas.getBoundingClientRect();
  
  // Convert to canvas coordinates without device pixel ratio scaling
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const pressure = 'pressure' in event ? event.pressure || 1 : 1;
  
  // Clamp coordinates to canvas bounds
  const clampedX = Math.max(0, Math.min(x, rect.width));
  const clampedY = Math.max(0, Math.min(y, rect.height));
  
  return { x: clampedX, y: clampedY, pressure };
}

export function calculatePileSize(totalAmount: number): number {
  // Calculate the radius of paint pile based on total amount (in mL)
  // Assume paint spreads in a circular pile with realistic thickness
  const thickness = 2; // mm thickness of paint pile
  const densityFactor = 0.8; // Paint density factor
  
  if (totalAmount <= 0) return 0;
  
  // Volume = π * r² * thickness
  // r = sqrt(volume / (π * thickness))
  const radius = Math.sqrt((totalAmount * 1000) / (Math.PI * thickness * densityFactor));
  
  return Math.max(radius, 8); // Minimum visible size
}

export function renderStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  pigments: Pigment[]
): void {
  const pigmentMap = new Map(pigments.map(p => [p.id, p]));
  
  strokes.forEach(stroke => {
    const pigment = pigmentMap.get(stroke.pigmentId);
    if (!pigment || stroke.points.length === 0) return;
    
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = pigment.swatchHex;
    ctx.strokeStyle = pigment.swatchHex;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw each point in the stroke
    stroke.points.forEach((point, index) => {
      const radius = (stroke.brushRadius / 2) * (point.pressure || 1);
      
      if (index === 0) {
        // Draw initial point
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw line segment
        const prevPoint = stroke.points[index - 1];
        const prevRadius = (stroke.brushRadius / 2) * (prevPoint.pressure || 1);
        
        ctx.beginPath();
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.lineWidth = Math.max(radius, prevRadius) * 2;
        ctx.stroke();
        
        // Draw end cap
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    ctx.restore();
  });
}

export function renderMixedPile(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  mixedColor: { r: number; g: number; b: number },
  totalAmount: number
): void {
  // Mixed pile rendering removed - no longer showing mixed color pile on canvas
  return;
}
