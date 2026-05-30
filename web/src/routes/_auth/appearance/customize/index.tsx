import { createFileRoute } from "@tanstack/react-router";

import { CustomizePage } from "@/modules/appearance/pages/CustomizePage";

type CustomizeSearch = {
  section?: string;
};

export const Route = createFileRoute("/_auth/appearance/customize/")({
  validateSearch: (search: Record<string, unknown>): CustomizeSearch => ({
    section: typeof search.section === "string" ? search.section : undefined,
  }),
  component: CustomizePage,
});
