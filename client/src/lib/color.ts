import type { RGB, Lab, OKLab } from "@shared/schema";

// sRGB ↔ linear RGB conversion
export const srgbToLinear = (u: number): number => 
  u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);

export const linearToSrgb = (u: number): number => 
  u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055;

export function rgbToLinear({ r, g, b }: RGB): RGB {
  return {
    r: srgbToLinear(r / 255),
    g: srgbToLinear(g / 255),
    b: srgbToLinear(b / 255),
  };
}

export function linearToRgb({ r, g, b }: RGB): RGB {
  return {
    r: Math.max(0, Math.min(255, Math.round(255 * linearToSrgb(r)))),
    g: Math.max(0, Math.min(255, Math.round(255 * linearToSrgb(g)))),
    b: Math.max(0, Math.min(255, Math.round(255 * linearToSrgb(b)))),
  };
}

// Linear RGB ↔ OKLab conversion (simplified matrices)
export function linearRgbToOKLab({ r, g, b }: RGB): OKLab {
  // Linear RGB to LMS
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  // LMS to LMS'
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  // LMS' to OKLab
  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

export function okLabToLinearRgb({ L, a, b }: OKLab): RGB {
  // OKLab to LMS'
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  // LMS' to LMS (ensure positive values before cubing)
  const l = Math.max(0, l_) ** 3;
  const m = Math.max(0, m_) ** 3;
  const s = Math.max(0, s_) ** 3;

  // LMS to Linear RGB
  const red = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const green = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const blue = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  
  return {
    r: Math.max(0, Math.min(1, red)),
    g: Math.max(0, Math.min(1, green)),
    b: Math.max(0, Math.min(1, blue)),
  };
}

// High-level color conversion functions
export function rgbToOKLab(rgb: RGB): OKLab {
  return linearRgbToOKLab(rgbToLinear(rgb));
}

export function okLabToRgb(oklab: OKLab): RGB {
  return linearToRgb(okLabToLinearRgb(oklab));
}

// Color mixing in OKLab space with subtractive behavior
export function mixColorsOKLab(colors: { color: OKLab; weight: number }[]): OKLab {
  const totalWeight = colors.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) return { L: 1, a: 0, b: 0 };

  // Weighted average in OKLab space
  const mixedL = colors.reduce((sum, c) => sum + c.color.L * c.weight, 0) / totalWeight;
  const mixedA = colors.reduce((sum, c) => sum + c.color.a * c.weight, 0) / totalWeight;
  const mixedB = colors.reduce((sum, c) => sum + c.color.b * c.weight, 0) / totalWeight;

  // Improved subtractive mixing with better darkening behavior
  const numColors = colors.filter(c => c.weight > 0).length;
  const complexity = Math.min(numColors / 3, 1); // More colors = more complex mixing
  const darkeningFactor = 0.15 + complexity * 0.15; // Variable darkening based on complexity
  
  // Apply subtractive darkening
  const adjustedL = mixedL * (1 - darkeningFactor);

  return {
    L: Math.max(0.05, Math.min(1, adjustedL)), // Prevent pure black and pure white
    a: Math.max(-0.5, Math.min(0.5, mixedA)), // Clamp chroma values
    b: Math.max(-0.5, Math.min(0.5, mixedB)),
  };
}

// ΔE2000 color difference calculation (simplified)
export function deltaE2000(lab1: Lab, lab2: Lab): number {
  const kL = 1;
  const kC = 1;
  const kH = 1;

  const deltaL = lab2.L - lab1.L;
  const C1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
  const C2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
  const deltaC = C2 - C1;
  const deltaCab = Math.sqrt((lab2.a - lab1.a) ** 2 + (lab2.b - lab1.b) ** 2);
  const deltaH = Math.sqrt(Math.max(0, deltaCab ** 2 - deltaC ** 2));

  const Lbar = (lab1.L + lab2.L) / 2;
  const Cbar = (C1 + C2) / 2;

  const SL = 1 + (0.015 * (Lbar - 50) ** 2) / Math.sqrt(20 + (Lbar - 50) ** 2);
  const SC = 1 + 0.045 * Cbar;
  const SH = 1 + 0.015 * Cbar;

  return Math.sqrt(
    (deltaL / (kL * SL)) ** 2 +
    (deltaC / (kC * SC)) ** 2 +
    (deltaH / (kH * SH)) ** 2
  );
}

// Convert RGB to Lab for ΔE calculation
export function rgbToLab(rgb: RGB): Lab {
  // Simplified RGB to Lab conversion (approximate)
  const { r, g, b } = rgbToLinear(rgb);
  
  // Convert to XYZ
  const x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
  const y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
  const z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b;

  // Normalize by D65 illuminant
  const xn = x / 0.95047;
  const yn = y / 1.00000;
  const zn = z / 1.08883;

  const fx = xn > 0.008856 ? Math.cbrt(xn) : (7.787 * xn + 16/116);
  const fy = yn > 0.008856 ? Math.cbrt(yn) : (7.787 * yn + 16/116);
  const fz = zn > 0.008856 ? Math.cbrt(zn) : (7.787 * zn + 16/116);

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

// Utility functions
export function rgbToHex({ r, g, b }: RGB): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
}

export function calculateColorScore(target: RGB, mixed: RGB): { score: number; deltaE: number } {
  const targetLab = rgbToLab(target);
  const mixedLab = rgbToLab(mixed);
  const deltaE = deltaE2000(targetLab, mixedLab);
  
  // Score calculation: perfect match = 100, visible difference reduces score
  const score = Math.max(0, Math.round(100 - deltaE * 2.3));
  
  return { score, deltaE };
}
