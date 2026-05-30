import { createFileRoute } from "@tanstack/react-router";

import { PluginsPage } from "@/modules/plugins/pages/PluginsPage";

export const Route = createFileRoute("/_auth/plugins/")({
  component: PluginsPage,
});
