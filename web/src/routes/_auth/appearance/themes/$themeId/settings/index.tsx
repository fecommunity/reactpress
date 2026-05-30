import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/appearance/themes/$themeId/settings/")({
  beforeLoad: () => {
    throw redirect({
      to: "/appearance/customize",
      search: { section: "themeConfiguration" },
    });
  },
});
