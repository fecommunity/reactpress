import { createFileRoute } from "@tanstack/react-router";

import { PluginSettingsPage } from "@/modules/plugins/pages/PluginSettingsPage";

export const Route = createFileRoute("/_auth/plugins/$id/settings/")({
  component: function PluginSettingsRoute() {
    const { id } = Route.useParams();
    return <PluginSettingsPage pluginId={id} />;
  },
});
