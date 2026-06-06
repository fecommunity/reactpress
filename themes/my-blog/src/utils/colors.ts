const TAG_COLORS = [
  '#389e0d',
  '#cf1322',
  '#096dd9',
  '#d48806',
  '#c41d7f',
  '#531dab',
  '#a8071a',
  '#006d75',
  '#237804',
  '#d4380d',
  '#434343',
  '#ad8b00',
  '#595959',
  '#08979c',
  '#3f8600',
  '#0050b3',
];

function parseHexColor(hex: string): [number, number, number] | null {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    return [
      parseInt(normalized[0] + normalized[0], 16),
      parseInt(normalized[1] + normalized[1], 16),
      parseInt(normalized[2] + normalized[2], 16),
    ];
  }
  if (normalized.length === 6) {
    return [
      parseInt(normalized.slice(0, 2), 16),
      parseInt(normalized.slice(2, 4), 16),
      parseInt(normalized.slice(4, 6), 16),
    ];
  }
  return null;
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastBetween(bg: string, text: string): number {
  const bgRgb = parseHexColor(bg);
  const textRgb = parseHexColor(text);
  if (!bgRgb || !textRgb) return 1;
  const bgLum = relativeLuminance(...bgRgb);
  const textLum = relativeLuminance(...textRgb);
  const lighter = Math.max(bgLum, textLum);
  const darker = Math.min(bgLum, textLum);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getColorFromNumber(num: number): string {
  return TAG_COLORS[num % TAG_COLORS.length];
}

export function getReadableTextColor(backgroundColor: string): '#ffffff' | '#1a1a1a' {
  const whiteContrast = contrastBetween(backgroundColor, '#ffffff');
  const blackContrast = contrastBetween(backgroundColor, '#1a1a1a');
  return whiteContrast >= blackContrast ? '#ffffff' : '#1a1a1a';
}

export function getTagStyle(backgroundColor: string): { backgroundColor: string; color: string } {
  let bg = backgroundColor;
  let color = getReadableTextColor(bg);

  for (let attempt = 0; attempt < 12 && contrastBetween(bg, color) < 4.5; attempt += 1) {
    const rgb = parseHexColor(bg);
    if (!rgb) break;
    const factor = color === '#ffffff' ? 0.88 : 1.12;
    bg = toHex(rgb[0] * factor, rgb[1] * factor, rgb[2] * factor);
    color = getReadableTextColor(bg);
  }

  return { backgroundColor: bg, color };
}
