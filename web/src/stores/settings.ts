import { createPersistentStore } from "./createPersistentStore";
import type { AppLocale } from "@/i18n";
import { detectInitialLocale } from "@/i18n";

function getInitialDarkMode() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

interface SettingsState {
  darkMode: boolean;
  sidebarCollapsed: boolean;
  locale: AppLocale;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLocale: (locale: AppLocale) => void;
}

export const useSettingsStore = createPersistentStore<SettingsState>(
  (set) => ({
    darkMode: getInitialDarkMode(),
    sidebarCollapsed: false,
    locale: detectInitialLocale(),
    toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
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
