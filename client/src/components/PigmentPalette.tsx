import React from "react";
import type { Pigment } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface PigmentPaletteProps {
  pigments: Pigment[];
  activePigmentId: string;
  onSelectPigment: (pigmentId: string) => void;
}

export function PigmentPalette({ pigments, activePigmentId, onSelectPigment }: PigmentPaletteProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {pigments.map((pigment) => (
        <Button
          key={pigment.id}
          variant="ghost"
          className={`paint-tube h-auto p-3 text-left transition-all hover:bg-gray-100 border border-warm-gray-200 ${
            activePigmentId === pigment.id
              ? "active bg-yellow-50 border-yellow-300"
              : "bg-gray-50"
          }`}
          onClick={() => onSelectPigment(pigment.id)}
          data-testid={`pigment-${pigment.id}`}
        >
          <div className="flex flex-col items-start space-y-2 w-full">
            <div
              className="w-8 h-8 rounded-full border border-warm-gray-300"
              style={{ backgroundColor: pigment.swatchHex }}
            />
            <div className="font-medium text-xs text-warm-gray-900 leading-tight">
              {pigment.name}
            </div>
            <div className="pigment-info text-warm-gray-500 text-xs">
              {pigment.code}
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
}
