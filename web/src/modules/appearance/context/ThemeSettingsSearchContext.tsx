import type { ThemeConfigurationSchema } from "@fecommunity/reactpress-toolkit/extension";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import {
  buildThemeSettingsIndex,
  filterThemeSettingsIndex,
  getVisibleSettingIds,
  type ThemeSettingsIndexEntry,
} from "@/modules/appearance/utils/themeSettingsIndex";

type ThemeSettingsSearchContextValue = {
  query: string;
  setQuery: (q: string) => void;
  isSearchActive: boolean;
  visibleIds: Set<string>;
  index: ThemeSettingsIndexEntry[];
  filteredIndex: ThemeSettingsIndexEntry[];
  isEntryVisible: (id: string) => boolean;
  isSectionVisible: (sectionKey: string, sectionId: string) => boolean;
};

const ThemeSettingsSearchContext = createContext<ThemeSettingsSearchContextValue | null>(null);

export function ThemeSettingsSearchProvider({
  schema,
  children,
}: {
  schema: ThemeConfigurationSchema | null;
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const index = useMemo(() => buildThemeSettingsIndex(schema), [schema]);
  const isSearchActive = query.trim().length > 0;
  const visibleIds = useMemo(() => getVisibleSettingIds(index, query), [index, query]);
  const filteredIndex = useMemo(() => filterThemeSettingsIndex(index, query), [index, query]);

  const isEntryVisible = useCallback(
    (id: string) => !isSearchActive || visibleIds.has(id),
    [isSearchActive, visibleIds],
  );

  const isSectionVisible = useCallback(
    (sectionKey: string, sectionId: string) => {
      if (!isSearchActive) return true;
      if (visibleIds.has(sectionId)) return true;
      return index.some(
        (e) => e.sectionKey === sectionKey && e.level === 2 && e.fieldKey && visibleIds.has(e.id),
      );
    },
    [isSearchActive, visibleIds, index],
  );

  const value = useMemo(
    () => ({
      query,
      setQuery,
      isSearchActive,
      visibleIds,
      index,
      filteredIndex,
      isEntryVisible,
      isSectionVisible,
    }),
    [query, isSearchActive, visibleIds, index, filteredIndex, isEntryVisible, isSectionVisible],
  );

  return (
    <ThemeSettingsSearchContext.Provider value={value}>
      {children}
    </ThemeSettingsSearchContext.Provider>
  );
}

export function useThemeSettingsSearch(): ThemeSettingsSearchContextValue {
  const ctx = useContext(ThemeSettingsSearchContext);
  if (!ctx) {
    throw new Error("useThemeSettingsSearch must be used within ThemeSettingsSearchProvider");
  }
  return ctx;
}

/** Safe hook for optional search context (formily leaf components). */
export function useThemeSettingsSearchOptional(): ThemeSettingsSearchContextValue | null {
  return useContext(ThemeSettingsSearchContext);
}
