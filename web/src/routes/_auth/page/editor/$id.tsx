import { createFileRoute } from '@tanstack/react-router';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export const Route = createFileRoute('/_auth/page/editor/$id')({
  component: function PageEditorRoute() {
    const { id } = Route.useParams();
    return <ModulePlaceholder title={`编辑页面 #${id}`} />;
  },
});
