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
  
  // Draw initial dot
  drawPoint(engine, x, y, pressure);
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
  
  // Calculate segment length
  const segmentLength = Math.sqrt(
    Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2)
  );
  
  engine.currentStroke.points.push(newPoint);
  engine.currentStroke.length += segmentLength;
  
  // Draw line segment
  drawLineSegment(engine, lastPoint, newPoint);
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
  const radius = (engine.brushSize / 2) * pressure;
  
  engine.ctx.save();
  engine.ctx.globalAlpha = 0.8;
  engine.ctx.fillStyle = engine.activePigment.swatchHex;
  engine.ctx.beginPath();
  engine.ctx.arc(x, y, radius, 0, Math.PI * 2);
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

export function redrawAllStrokes(engine: PaintEngine, strokes: Stroke[], pigments: Pigment[]): void {
  engine.ctx.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
  
  const pigmentMap = new Map(pigments.map(p => [p.id, p]));
  
  strokes.forEach(stroke => {
    const pigment = pigmentMap.get(stroke.pigmentId);
    if (!pigment) return;
    
    const oldPigment = engine.activePigment;
    engine.activePigment = pigment;
    
    stroke.points.forEach((point, index) => {
      if (index === 0) {
        drawPoint(engine, point.x, point.y, point.pressure || 1);
      } else {
        drawLineSegment(engine, stroke.points[index - 1], point);
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
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const pressure = 'pressure' in event ? event.pressure || 1 : 1;
  
  return { x, y, pressure };
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
  if (totalAmount <= 0) return;
  
  const pileRadius = calculatePileSize(totalAmount);
  const centerX = canvas.width * 0.8; // Position pile in bottom right
  const centerY = canvas.height * 0.8;
  
  ctx.save();
  
  // Create gradient for realistic paint pile appearance
  const gradient = ctx.createRadialGradient(
    centerX - pileRadius * 0.3, centerY - pileRadius * 0.3, 0,
    centerX, centerY, pileRadius
  );
  
  const rgb = `rgb(${Math.round(mixedColor.r)}, ${Math.round(mixedColor.g)}, ${Math.round(mixedColor.b)})`;
  const highlight = `rgb(${Math.min(255, Math.round(mixedColor.r * 1.2))}, ${Math.min(255, Math.round(mixedColor.g * 1.2))}, ${Math.min(255, Math.round(mixedColor.b * 1.2))})`;
  const shadow = `rgb(${Math.round(mixedColor.r * 0.7)}, ${Math.round(mixedColor.g * 0.7)}, ${Math.round(mixedColor.b * 0.7)})`;
  
  gradient.addColorStop(0, highlight);
  gradient.addColorStop(0.6, rgb);
  gradient.addColorStop(1, shadow);
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, pileRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Add shine effect
  ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
  ctx.beginPath();
  ctx.ellipse(
    centerX - pileRadius * 0.3,
    centerY - pileRadius * 0.3,
    pileRadius * 0.4,
    pileRadius * 0.2,
    -Math.PI / 6,
    0,
    Math.PI * 2
  );
  ctx.fill();
  
  ctx.restore();
}
