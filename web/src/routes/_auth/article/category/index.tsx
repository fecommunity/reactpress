import { createFileRoute } from "@tanstack/react-router";

import { TaxonomyManagePage } from "@/modules/article/pages/TaxonomyManagePage";

export const Route = createFileRoute("/_auth/article/category/")({
  component: function ArticleCategoryRoute() {
    return <TaxonomyManagePage kind="category" />;
  },
});
