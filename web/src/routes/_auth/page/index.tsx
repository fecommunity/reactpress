import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";
import { PageListPage, type PageListSearch } from "@/modules/page/pages/PageListPage";

const PageSearchSchema = z.object({
  page: z.number().int().positive().catch(1),
  pageSize: z.number().int().positive().catch(12),
  status: z.string().catch(""),
  keyword: z.string().catch(""),
});

export const Route = createFileRoute("/_auth/page/")({
  validateSearch: (search) => PageSearchSchema.parse(search) as PageListSearch,
  component: function PageRoute() {
    const search = Route.useSearch();
    return <PageListPage search={search} routePath={Route.fullPath} />;
  },
});
