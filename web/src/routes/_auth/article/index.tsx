import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';
import { ArticleListPage } from '@/modules/article/pages/ArticleListPage';

const ArticleSearchSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().catch(20),
  status: z.string().catch(''),
  keyword: z.string().catch(''),
  category: z.string().catch(''),
  tag: z.string().catch(''),
  month: z.string().catch(''),
  author: z.string().catch(''),
});

export const Route = createFileRoute('/_auth/article/')({
  validateSearch: (search) => ArticleSearchSchema.parse(search),
  component: function ArticleRoute() {
    const search = Route.useSearch();
    return <ArticleListPage search={search} routePath={Route.fullPath} />;
  },
});
