export type ColorScheme = 'light' | 'dark';

export const COLOR_SCHEME_STORAGE_KEY = 'twentytwentysix-color-scheme';

export function isColorScheme(value: string | null | undefined): value is ColorScheme {
  return value === 'light' || value === 'dark';
}

export function readStoredColorScheme(): ColorScheme | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
    return isColorScheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function persistColorScheme(scheme: ColorScheme): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
  } catch {
    /* ignore quota / private mode */
  }
}
