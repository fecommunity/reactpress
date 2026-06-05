import TagsPageContent from '@/components/TagsPageContent';
import { loadAppBootstrap } from '@/src/reactpress/bootstrap';
import type { ITag } from '@fecommunity/reactpress-toolkit/types';

export const revalidate = 60;

export default async function TagsPage() {
  const bootstrap = await loadAppBootstrap('/tags');
  const tags = (bootstrap.tags ?? []) as ITag[];

  return <TagsPageContent tags={tags} />;
}
