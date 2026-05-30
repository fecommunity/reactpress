import type { SiteThemeState, ThemeMods } from "@fecommunity/reactpress-toolkit/theme";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  activateTheme,
  fetchTheme,
  fetchThemes,
  installTheme,
  saveThemeMods,
  type ThemeListItem,
} from "@/shared/api/themes";

export type ActivateThemeResult = SiteThemeState & { siteUrl?: string };

const THEMES_KEY = ["themes"];

export function useThemes() {
  return useQuery({
    queryKey: THEMES_KEY,
    queryFn: fetchThemes,
    staleTime: 30_000,
  });
}

export function useTheme(id: string | undefined) {
  return useQuery({
    queryKey: [...THEMES_KEY, id],
    queryFn: () => fetchTheme(id!),
    enabled: Boolean(id),
  });
}

export function useThemeMutations() {
  const queryClient = useQueryClient();

  const patchThemesFromState = (state: SiteThemeState) => {
    queryClient.setQueryData<ThemeListItem[]>(THEMES_KEY, (old) => {
      if (!old) return old;
      return old.map((theme) => ({
        ...theme,
        installed: state.installedThemes.includes(theme.id),
        active: state.activeTheme === theme.id,
      }));
    });
  };

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: THEMES_KEY });
    void queryClient.invalidateQueries({ queryKey: ["site-settings"] });
  };

  const installMutation = useMutation({
    mutationFn: (id: string) => installTheme(id),
    onSuccess: (state) => {
      patchThemesFromState(state);
      invalidate();
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => activateTheme(id),
    onSuccess: (state) => {
      patchThemesFromState(state);
      invalidate();
    },
  });

  const modsMutation = useMutation({
    mutationFn: ({ themeId, mods }: { themeId: string; mods: ThemeMods }) =>
      saveThemeMods(themeId, mods),
    onSuccess: invalidate,
  });

  return { installMutation, activateMutation, modsMutation };
}

export type { ThemeListItem };
