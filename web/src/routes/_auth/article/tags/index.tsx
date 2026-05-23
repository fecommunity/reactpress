import { createFileRoute } from "@tanstack/react-router";
import { TaxonomyManagePage } from "@/modules/article/pages/TaxonomyManagePage";

export const Route = createFileRoute("/_auth/article/tags/")({
  component: function ArticleTagsRoute() {
    return <TaxonomyManagePage kind="tag" />;
  },
});
