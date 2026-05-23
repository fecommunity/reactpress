import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';
import { MediaListPage } from '@/modules/media/pages/MediaListPage';

const MediaSearchSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().catch(60),
  keyword: z.string().catch(''),
  type: z.string().catch(''),
  month: z.string().catch(''),
  view: z.enum(['grid', 'list']).catch('grid'),
});

export const Route = createFileRoute('/_auth/media/')({
  validateSearch: (search) => MediaSearchSchema.parse(search),
  component: function MediaRoute() {
    const search = Route.useSearch();
    return <MediaListPage search={search} routePath={Route.fullPath} />;
  },
});
