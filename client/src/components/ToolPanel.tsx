import React from "react";
import type { Pigment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PigmentPalette } from "./PigmentPalette";
import { Paintbrush, Blend, Undo, Trash } from "lucide-react";

interface ToolPanelProps {
  pigments: Pigment[];
  activePigmentId: string;
  brushSize: number;
  paintAmounts: Record<string, number>;
  totalAmount: number;
  strokeCount: number;
  canUndo: boolean;
  onSelectPigment: (pigmentId: string) => void;
  onBrushSizeChange: (size: number) => void;
  onMixColors: () => void;
  onUndo: () => void;
  onClear: () => void;
}

export function ToolPanel({
  pigments,
  activePigmentId,
  brushSize,
  paintAmounts,
  totalAmount,
  strokeCount,
  canUndo,
  onSelectPigment,
  onBrushSizeChange,
  onMixColors,
  onUndo,
  onClear,
}: ToolPanelProps) {
  const activePigment = pigments.find(p => p.id === activePigmentId);

  const formatAmount = (amount: number) => {
    return amount < 0.1 ? `${(amount * 1000).toFixed(0)}μL` : `${amount.toFixed(1)} mL`;
  };

  return (
    <aside className="w-80 bg-white border-l border-warm-gray-200 p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Pigment Tubes */}
        <div>
          <h3 className="font-semibold text-warm-gray-900 mb-4 flex items-center">
            <Paintbrush className="w-4 h-4 mr-2 text-blue-600" />
            Oil Pigments
          </h3>
          <PigmentPalette
            pigments={pigments}
            activePigmentId={activePigmentId}
            onSelectPigment={onSelectPigment}
          />
        </div>

        {/* Brush Controls */}
        <div className="border-t border-warm-gray-200 pt-6">
          <h4 className="font-semibold text-warm-gray-900 mb-4 flex items-center">
            <Paintbrush className="w-4 h-4 mr-2 text-green-600" />
            Brush Settings
          </h4>

          {/* Brush Size */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-warm-gray-700 mb-2">
              Brush Size: <span className="font-normal" data-testid="text-brush-size">{brushSize}px</span>
            </label>
            <Slider
              value={[brushSize]}
              onValueChange={([value]) => onBrushSizeChange(value)}
              min={8}
              max={96}
              step={1}
              className="w-full"
              data-testid="slider-brush-size"
            />
            <div className="flex justify-between text-xs text-warm-gray-500 mt-1">
              <span>Fine</span>
              <span>Thick</span>
            </div>
          </div>

          {/* Active Pigment Display */}
          {activePigment && (
            <div className="bg-warm-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-6 h-6 rounded-full border border-warm-gray-300"
                  style={{ backgroundColor: activePigment.swatchHex }}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-warm-gray-900" data-testid="text-active-pigment-name">
                    {activePigment.name}
                  </div>
                  <div className="text-xs text-warm-gray-500" data-testid="text-active-pigment-code">
                    {activePigment.code}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-warm-gray-200 pt-6 space-y-3">
          <Button
            onClick={onMixColors}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3"
            disabled={totalAmount === 0}
            data-testid="button-mix-colors"
          >
            <Blend className="w-4 h-4 mr-2" />
            Mix Colors
          </Button>

          <div className="flex space-x-3">
            <Button
              onClick={onUndo}
              variant="outline"
              className="flex-1 bg-warm-gray-200 hover:bg-warm-gray-300 text-warm-gray-700 font-medium"
              disabled={!canUndo}
              data-testid="button-undo"
            >
              <Undo className="w-4 h-4 mr-1" />
              Undo
            </Button>
            <Button
              onClick={onClear}
              variant="outline"
              className="flex-1 bg-warm-gray-200 hover:bg-warm-gray-300 text-warm-gray-700 font-medium"
              disabled={strokeCount === 0}
              data-testid="button-clear"
            >
              <Trash className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>

          {/* Paint Amount Summary */}
          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            <div className="font-medium text-blue-900 mb-2">Paint Used</div>
            <div className="space-y-1 text-blue-800">
              {Object.entries(paintAmounts).length === 0 ? (
                <div className="text-blue-600 text-xs">No paint used yet</div>
              ) : (
                Object.entries(paintAmounts).map(([pigmentId, amount]) => {
                  const pigment = pigments.find(p => p.id === pigmentId);
                  return (
                    <div key={pigmentId} className="flex justify-between" data-testid={`paint-amount-${pigmentId}`}>
                      <span>{pigment?.name || "Unknown"}:</span>
                      <span>{formatAmount(amount)}</span>
                    </div>
                  );
                })
              )}
              {totalAmount > 0 && (
                <div className="flex justify-between font-medium border-t border-blue-200 pt-1 mt-2">
                  <span>Total:</span>
                  <span data-testid="text-total-amount">{formatAmount(totalAmount)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
