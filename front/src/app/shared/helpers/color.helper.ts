export interface ColorScale {
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  1000: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) throw new Error(`Invalid hex color: ${hex}`);
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(v => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0'))
    .join('');
}

function blendWhite(c: { r: number; g: number; b: number }, ratio: number) {
  return { r: c.r + (255 - c.r) * ratio, g: c.g + (255 - c.g) * ratio, b: c.b + (255 - c.b) * ratio };
}

function blendBlack(c: { r: number; g: number; b: number }, ratio: number) {
  return { r: c.r * (1 - ratio), g: c.g * (1 - ratio), b: c.b * (1 - ratio) };
}

export function generateColorScale(hex: string): ColorScale {
  const base = hexToRgb(hex);
  const t = (c: { r: number; g: number; b: number }) => rgbToHex(c.r, c.g, c.b);
  return {
    100:  t(blendWhite(base, 0.85)),
    200:  t(blendWhite(base, 0.70)),
    300:  t(blendWhite(base, 0.50)),
    400:  t(blendWhite(base, 0.28)),
    500:  hex,
    600:  t(blendBlack(base, 0.15)),
    700:  t(blendBlack(base, 0.30)),
    800:  t(blendBlack(base, 0.50)),
    900:  t(blendBlack(base, 0.65)),
    1000: t(blendBlack(base, 0.80)),
  };
}

export function applyColorScale(prefix: string, scale: ColorScale): void {
  const root = document.documentElement;
  (Object.entries(scale) as [string, string][])
    .forEach(([step, value]) => root.style.setProperty(`--${prefix}-${step}`, value));
}
