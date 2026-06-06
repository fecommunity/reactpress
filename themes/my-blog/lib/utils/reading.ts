/** Estimate reading time from HTML content (CJK-aware). */
export function estimateReadMinutes(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 1;

  const cjkChars = (text.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || []).length;
  if (cjkChars > text.length * 0.25) {
    return Math.max(1, Math.ceil(text.length / 400));
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
