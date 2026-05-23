import type { AuthTokens, User, MenuItem } from "@/api/schemas";
import { createPersistentStore } from "./createPersistentStore";

interface AuthState {
  tokens: AuthTokens | null;
  user: User | null;
  menus: MenuItem[];
  isAuthenticated: boolean;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  setMenus: (menus: MenuItem[]) => void;
  hasPermission: (point: string) => boolean;
  logout: () => void;
}

export const useAuthStore = createPersistentStore<AuthState>(
  (set, get) => ({
    tokens: null,
    user: null,
    menus: [],
    isAuthenticated: false,

    setTokens: (tokens) => set({ tokens, isAuthenticated: true }),
    setUser: (user) => set({ user }),
    setMenus: (menus) => set({ menus }),

    hasPermission: (point) => {
      const { user } = get();
      return user?.permissions.includes(point) ?? false;
    },

    logout: () =>
      set({
        tokens: null,
        user: null,
        menus: [],
        isAuthenticated: false,
      }),
  }),
  {
    name: "auth-storage",
    partialize: (state) => ({
      tokens: state.tokens,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
    }),
    merge: (persistedState, currentState) => {
      const p = persistedState as Partial<
        Pick<AuthState, "tokens" | "isAuthenticated" | "user">
      > | null;
      return {
        ...currentState,
        tokens: p?.tokens ?? currentState.tokens,
        isAuthenticated: p?.isAuthenticated ?? currentState.isAuthenticated,
        user: p?.user ?? null,
        menus: [],
      };
    },
  },
);
