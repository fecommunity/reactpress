import { createFileRoute } from '@tanstack/react-router';
import { ArticleEditorPage } from '@/modules/article/pages/ArticleEditorPage';

export const Route = createFileRoute('/_auth/article/editor/')({
  component: function NewArticleRoute() {
    return <ArticleEditorPage />;
  },
});
