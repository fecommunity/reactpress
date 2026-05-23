import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';
import { CommentListPage } from '@/modules/comment/pages/CommentListPage';

const CommentSearchSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().catch(12),
  pass: z.string().catch(''),
  name: z.string().catch(''),
  email: z.string().catch(''),
});

export const Route = createFileRoute('/_auth/article/comment/')({
  validateSearch: (search) => CommentSearchSchema.parse(search),
  component: function CommentRoute() {
    const search = Route.useSearch();
    return <CommentListPage search={search} routePath={Route.fullPath} />;
  },
});
