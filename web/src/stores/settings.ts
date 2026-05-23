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
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useSettingsStore = createPersistentStore<SettingsState>(
  (set) => ({
    darkMode: getInitialDarkMode(),
    sidebarCollapsed: false,
    toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  }),
  {
    name: "settings-storage-basic",
    partialize: (state) => ({
      darkMode: state.darkMode,
      sidebarCollapsed: state.sidebarCollapsed,
    }),
  },
);
