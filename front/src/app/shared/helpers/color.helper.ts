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

const NEUTRAL: Record<number, string> = {
  0:    '#ffffff',
  100:  '#f5f5f6',
  200:  '#e9e9eb',
  300:  '#d4d4d8',
  400:  '#a1a1aa',
  500:  '#71717a',
  600:  '#52525b',
  700:  '#3f3f46',
  800:  '#27272a',
  900:  '#18181b',
  1000: '#000000',
};

const SEMANTIC: Record<string, string> = {
  '--color-error':         '#ef233c',
  '--color-error-light':   '#fde8eb',
  '--color-error-dark':    '#b5152b',
  '--color-success':       '#2dc653',
  '--color-success-light': '#e6f9eb',
  '--color-success-dark':  '#1a9b3d',
  '--color-warning':       '#f4a261',
  '--color-warning-light': '#fef3e8',
  '--color-warning-dark':  '#d97833',
  '--color-info':          '#4cc9f0',
  '--color-info-light':    '#e8f8fd',
  '--color-info-dark':     '#1ba3cc',
};

export function applyBaseTokens(): void {
  const root = document.documentElement;

  Object.entries(NEUTRAL).forEach(([step, value]) =>
    root.style.setProperty(`--neutral-${step}`, value),
  );

  Object.entries(SEMANTIC).forEach(([prop, value]) =>
    root.style.setProperty(prop, value),
  );

  root.style.setProperty('--color-bg',         'var(--neutral-100)');
  root.style.setProperty('--color-surface',     'var(--neutral-0)');
  root.style.setProperty('--color-border',      'var(--neutral-300)');
  root.style.setProperty('--color-text',        'var(--neutral-900)');
  root.style.setProperty('--color-text-muted',  'var(--neutral-600)');
}
