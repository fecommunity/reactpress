import { create } from "zustand";

import {
  getDesktopApiMode,
  isDesktopRuntime,
  type DesktopApiMode,
} from "@/shared/desktop/apiConfig";

type DesktopStore = {
  mode: DesktopApiMode | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setMode: (mode: DesktopApiMode) => void;
};

export const useDesktopStore = create<DesktopStore>((set) => ({
  mode: null,
  loading: false,
  refresh: async () => {
    if (!isDesktopRuntime()) {
      set({ mode: null, loading: false });
      return;
    }
    set({ loading: true });
    try {
      const mode = (await getDesktopApiMode()) ?? "local";
      set({ mode, loading: false });
    } catch {
      set({ mode: "local", loading: false });
    }
  },
  setMode: (mode) => set({ mode }),
}));
