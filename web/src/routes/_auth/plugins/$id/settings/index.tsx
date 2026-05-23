import { createFileRoute } from '@tanstack/react-router';
import { SettingsTabForm } from '@/modules/settings/components/SettingsTabForm';

export const Route = createFileRoute('/_auth/plugins/$id/settings/')({
  component: function PluginSettingsRoute() {
    const { id } = Route.useParams();
    return <SettingsTabForm tab="general" key={id} />;
  },
});
