import { createFileRoute } from "@tanstack/react-router";

import { ThemePreviewPage } from "@/modules/appearance/pages/ThemePreviewPage";

export const Route = createFileRoute("/_auth/appearance/themes/preview/")({
  validateSearch: (search: Record<string, unknown>) => ({
    theme: typeof search.theme === "string" ? search.theme : undefined,
  }),
  component: function ThemePreviewRoute() {
    const { theme } = Route.useSearch();
    return <ThemePreviewPage themeIdFromSearch={theme} />;
  },
});
