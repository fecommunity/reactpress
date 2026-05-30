import { createFileRoute } from "@tanstack/react-router";

import { ThemesPage } from "@/modules/appearance/pages/ThemesPage";

export const Route = createFileRoute("/_auth/appearance/themes/")({
  component: ThemesPage,
});
