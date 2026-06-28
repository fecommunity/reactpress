import { useEffect } from "react";

import { isDesktopRuntime } from "@/shared/desktop/apiConfig";
import { queryClient } from "@/shared/queryClient";
import { useDesktopStore } from "@/stores/desktop";

const DEFAULT_QUERY_OPTIONS = {
  retry: 1,
  refetchOnWindowFocus: false,
} as const;

const LOCAL_DESKTOP_QUERY_OPTIONS = {
  ...DEFAULT_QUERY_OPTIONS,
  staleTime: 0,
  refetchOnMount: "always" as const,
};

/**
 * Desktop local mode writes to embedded SQLite — prefer fresh reads over long-lived cache
 * so sidebar navigation does not show stale lists/settings until a manual reload.
 */
export function DesktopLocalQueryPolicy() {
  const mode = useDesktopStore((s) => s.mode);
  const refreshDesktopMode = useDesktopStore((s) => s.refresh);

  useEffect(() => {
    void refreshDesktopMode();
  }, [refreshDesktopMode]);

  useEffect(() => {
    if (!isDesktopRuntime()) return;

    queryClient.setDefaultOptions({
      queries: mode === "local" ? LOCAL_DESKTOP_QUERY_OPTIONS : DEFAULT_QUERY_OPTIONS,
    });
  }, [mode]);

  return null;
}
