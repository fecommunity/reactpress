export const COLOR_MODE_STORAGE_KEY = 'dark';

export function resolvePreferredColorMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const storageTheme = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);
  if (storageTheme != null) {
    return storageTheme === '1';
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function applyColorModeClass(isDark: boolean): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.body.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

export function persistColorMode(isDark: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, isDark ? '1' : '-1');
}

export function resolveInitialThemeState(): 'dark' | 'light' | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return resolvePreferredColorMode() ? 'dark' : 'light';
}

/** Runs before paint to avoid light-mode flash on first visit. */
export const colorModeInitScript = `(function(){try{var k='${COLOR_MODE_STORAGE_KEY}';var s=localStorage.getItem(k);var d=s==='1'||(s==null&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.style.colorScheme='dark';document.body.classList.add('dark');}else{document.documentElement.style.colorScheme='light';}}catch(e){}})();`;
