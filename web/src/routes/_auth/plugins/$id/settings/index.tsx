import { createFileRoute } from '@tanstack/react-router';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export const Route = createFileRoute('/_auth/plugins/$id/settings/')({
  component: function PluginSettingsRoute() {
    const { id } = Route.useParams();
    return <ModulePlaceholder title={`插件设置：${id}`} />;
  },
});
