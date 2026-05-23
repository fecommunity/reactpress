import { createFileRoute } from '@tanstack/react-router';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export const Route = createFileRoute('/_auth/article/editor/$id')({
  component: function ArticleEditorRoute() {
    const { id } = Route.useParams();
    return <ModulePlaceholder title={`编辑文章 #${id}`} />;
  },
});
