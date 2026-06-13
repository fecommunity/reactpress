/**
 * SVG placeholder cover for themes without a cover image file.
 * Used by the extension API and web dev mocks.
 */

function escapeXml(text) {
  return String(text).replace(/[<>&"']/g, (ch) => {
    const map = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[ch] ?? ch;
  });
}

function sanitizeColor(color, fallback) {
  if (!color) return fallback;
  const trimmed = String(color).trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) return trimmed;
  return fallback;
}

function safeSvgId(id) {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '') || 'theme';
}

/**
 * @param {{ id: string; name: string; primary?: string; accent?: string; version?: string }} options
 */
function buildThemePlaceholderCoverSvg(options) {
  const svgId = safeSvgId(options.id);
  const primary = sanitizeColor(options.primary, '#2563eb');
  const accent = sanitizeColor(options.accent, '#7c3aed');
  const rawName = String(options.name ?? options.id ?? 'Theme');
  const safeName = escapeXml(rawName.length > 48 ? `${rawName.slice(0, 45)}…` : rawName);
  const version = options.version ? escapeXml(String(options.version)) : '';

  const versionBadge = version
    ? `<rect x="656" y="28" width="112" height="26" rx="13" fill="#ffffff" fill-opacity="0.08"/>
  <text x="712" y="45" text-anchor="middle" fill="#ffffff" fill-opacity="0.65" font-family="system-ui,-apple-system,sans-serif" font-size="11" font-weight="500">v${version}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" role="img" aria-label="${safeName}">
  <defs>
    <linearGradient id="${svgId}-bg" x1="0" y1="0" x2="800" y2="500" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0b1220"/>
      <stop offset="100%" stop-color="#151b2b"/>
    </linearGradient>
    <linearGradient id="${svgId}-hero" x1="0" y1="0" x2="512" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
    <radialGradient id="${svgId}-glow1" cx="0" cy="0" r="1" gradientTransform="translate(96 48) rotate(90) scale(220 220)">
      <stop offset="0%" stop-color="${primary}" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="${primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${svgId}-glow2" cx="0" cy="0" r="1" gradientTransform="translate(704 432) rotate(90) scale(260 260)">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="${svgId}-grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0H0V32" fill="none" stroke="#ffffff" stroke-opacity="0.045" stroke-width="1"/>
    </pattern>
    <filter id="${svgId}-shadow" x="-16%" y="-16%" width="132%" height="132%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000000" flood-opacity="0.38"/>
    </filter>
  </defs>
  <rect width="800" height="500" fill="url(#${svgId}-bg)"/>
  <rect width="800" height="500" fill="url(#${svgId}-glow1)"/>
  <rect width="800" height="500" fill="url(#${svgId}-glow2)"/>
  <rect width="800" height="500" fill="url(#${svgId}-grid)"/>
  <rect x="32" y="28" width="112" height="26" rx="13" fill="#ffffff" fill-opacity="0.08"/>
  <text x="74" y="45" text-anchor="middle" fill="#ffffff" fill-opacity="0.75" font-family="system-ui,-apple-system,sans-serif" font-size="11" font-weight="600" letter-spacing="0.08em">REACTPRESS</text>
  ${versionBadge}
  <g transform="translate(120 68)" filter="url(#${svgId}-shadow)">
    <rect width="560" height="328" rx="14" fill="#ffffff"/>
    <path d="M0 14C0 6.268 6.268 0 14 0h532c7.732 0 14 6.268 14 14v38H0V14z" fill="#f8fafc"/>
    <circle cx="28" cy="19" r="5.5" fill="#ff5f57" fill-opacity="0.88"/>
    <circle cx="48" cy="19" r="5.5" fill="#febc2e" fill-opacity="0.88"/>
    <circle cx="68" cy="19" r="5.5" fill="#28c840" fill-opacity="0.88"/>
    <rect x="120" y="12" width="320" height="14" rx="7" fill="#e2e8f0"/>
    <rect x="24" y="62" width="512" height="108" rx="10" fill="url(#${svgId}-hero)"/>
    <rect x="40" y="86" width="196" height="14" rx="7" fill="#ffffff" fill-opacity="0.92"/>
    <rect x="40" y="108" width="272" height="10" rx="5" fill="#ffffff" fill-opacity="0.55"/>
    <rect x="24" y="194" width="340" height="10" rx="5" fill="#e2e8f0"/>
    <rect x="24" y="214" width="420" height="8" rx="4" fill="#f1f5f9"/>
    <rect x="24" y="228" width="380" height="8" rx="4" fill="#f1f5f9"/>
    <rect x="24" y="252" width="160" height="52" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="200" y="252" width="160" height="52" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="376" y="252" width="136" height="52" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  </g>
  <text x="400" y="456" text-anchor="middle" fill="#ffffff" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="24" font-weight="600">${safeName}</text>
  <text x="400" y="478" text-anchor="middle" fill="#ffffff" fill-opacity="0.5" font-family="system-ui,-apple-system,sans-serif" font-size="12" font-weight="500">Theme Preview</text>
</svg>`;
}

module.exports = { buildThemePlaceholderCoverSvg };