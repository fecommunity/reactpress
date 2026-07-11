import { useCallback, useEffect, useRef, useState } from "react";

import {
  clearThemeSettingsScrollLock,
  getLockedThemeSettingsId,
  getThemeSettingsScrollLockRemainingMs,
  lockThemeSettingsScroll,
} from "@/modules/appearance/utils/themeSettingsScrollLock";

/** Pick the last setting block whose top has passed the scroll marker (VS Code–style). */
export function pickActiveSettingId(
  container: HTMLElement,
  orderedIds: readonly string[],
  offset = 72,
): string | null {
  if (orderedIds.length === 0) return null;

  const marker = container.getBoundingClientRect().top + offset;
  let active = orderedIds[0];

  for (const id of orderedIds) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= marker) {
      active = id;
    } else {
      break;
    }
  }

  return active;
}

type Options = {
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  orderedIds: readonly string[];
  resetKey?: string;
};

export function useThemeSettingsActiveId({ scrollContainerRef, orderedIds, resetKey }: Options) {
  const [activeId, setActiveId] = useState<string | null>(() => orderedIds[0] ?? null);
  const rafRef = useRef<number | null>(null);
  const unlockTimerRef = useRef<number | null>(null);

  const syncFromScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || orderedIds.length === 0) return;

    const locked = getLockedThemeSettingsId();
    if (locked) {
      setActiveId((prev) => (prev === locked ? prev : locked));
      return;
    }

    const next = pickActiveSettingId(container, orderedIds);
    if (next) {
      setActiveId((prev) => (prev === next ? prev : next));
    }
  }, [orderedIds, scrollContainerRef]);

  const setActiveProgrammatically = useCallback(
    (id: string) => {
      lockThemeSettingsScroll(id);
      setActiveId(id);

      if (unlockTimerRef.current != null) {
        window.clearTimeout(unlockTimerRef.current);
      }
      unlockTimerRef.current = window.setTimeout(() => {
        unlockTimerRef.current = null;
        clearThemeSettingsScrollLock();
        syncFromScroll();
      }, getThemeSettingsScrollLockRemainingMs());
    },
    [syncFromScroll],
  );

  useEffect(() => {
    clearThemeSettingsScrollLock();
    setActiveId(orderedIds[0] ?? null);
  }, [resetKey, orderedIds]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        syncFromScroll();
      });
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    syncFromScroll();

    return () => {
      container.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (unlockTimerRef.current != null) {
        window.clearTimeout(unlockTimerRef.current);
      }
    };
  }, [scrollContainerRef, syncFromScroll, resetKey]);

  return { activeId, setActiveProgrammatically };
}
