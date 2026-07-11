import { createFileRoute } from "@tanstack/react-router";

import { ArticleEditorPage } from "@/modules/article/pages/ArticleEditorPage";

export const Route = createFileRoute("/_auth/article/editor/$id")({
  component: function ArticleEditorRoute() {
    const { id } = Route.useParams();
    return <ArticleEditorPage articleId={id} />;
  },
});
