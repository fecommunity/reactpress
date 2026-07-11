const PROGRAMMATIC_SCROLL_MS = 700;

const lock = {
  until: 0,
  id: null as string | null,
};

/** Keep sidebar highlight stable while smooth-scrolling to a setting. */
export function lockThemeSettingsScroll(id: string, ms = PROGRAMMATIC_SCROLL_MS): void {
  lock.id = id;
  lock.until = Date.now() + ms;
}

export function getLockedThemeSettingsId(): string | null {
  return Date.now() < lock.until ? lock.id : null;
}

export function clearThemeSettingsScrollLock(): void {
  lock.until = 0;
  lock.id = null;
}

export function getThemeSettingsScrollLockRemainingMs(): number {
  return Math.max(0, lock.until - Date.now());
}
