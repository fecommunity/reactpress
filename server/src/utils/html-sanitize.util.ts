const STRIP_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'link',
  'style',
  'meta',
  'base',
  'applet',
  'frame',
  'frameset',
];

export function sanitizeHtml(html: string): string {
  let clean = html;

  for (const tag of STRIP_TAGS) {
    clean = clean.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'), '');
    clean = clean.replace(new RegExp(`<${tag}\\b[^>]*\\/>`, 'gi'), '');
    clean = clean.replace(new RegExp(`<${tag}\\b[^>]*>`, 'gi'), '');
  }

  // Strip event handlers
  clean = clean.replace(/\bon\w+\s*=\s*"(?:[^"\\]|\\.)*"/gi, '');
  clean = clean.replace(/\bon\w+\s*=\s*'(?:[^'\\]|\\.)*'/gi, '');
  clean = clean.replace(/\bon\w+\s*=\s*[^\s>]+/gi, '');

  // Strip javascript: URLs (remove protocol and following payload)
  clean = clean.replace(/href\s*=\s*"javascript\s*:[^"]*"/gi, '');
  clean = clean.replace(/href\s*=\s*'javascript\s*:[^']*'/gi, '');
  clean = clean.replace(/javascript\s*:/gi, '');

  return clean;
}
