import type { AppLocale } from "@/i18n";
import { detectInitialLocale } from "@/i18n";

import { createPersistentStore } from "./createPersistentStore";

function getInitialDarkMode() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

interface SettingsState {
  darkMode: boolean;
  sidebarCollapsed: boolean;
  /** Mobile drawer open state (not persisted; desktop uses sidebarCollapsed). */
  mobileSidebarOpen: boolean;
  locale: AppLocale;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setLocale: (locale: AppLocale) => void;
}

export const useSettingsStore = createPersistentStore<SettingsState>(
  (set) => ({
    darkMode: getInitialDarkMode(),
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
    locale: detectInitialLocale(),
    toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
    setLocale: (locale) => set({ locale }),
  }),
  {
    name: "settings-storage-basic",
    partialize: (state) => ({
      darkMode: state.darkMode,
      sidebarCollapsed: state.sidebarCollapsed,
      locale: state.locale,
    }),
  },
);
