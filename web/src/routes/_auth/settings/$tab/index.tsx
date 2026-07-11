import { createFileRoute, redirect } from "@tanstack/react-router";

import { SettingsLayoutPage } from "@/modules/settings/pages/SettingsLayoutPage";
import { getSettingsTabs } from "@/shell/bootstrap";

export const Route = createFileRoute("/_auth/settings/$tab/")({
  beforeLoad: ({ params }) => {
    const tabs = getSettingsTabs();
    if (!tabs.some((t) => t.id === params.tab)) {
      throw redirect({ to: "/settings/$tab", params: { tab: "general" } });
    }
  },
  component: function SettingsTabRoute() {
    const { tab } = Route.useParams();
    return <SettingsLayoutPage tab={tab} />;
  },
});
