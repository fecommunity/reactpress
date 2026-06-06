import TagsClient from '@/components/views/TagsClient';
import { loadAppBootstrap } from '@/lib/reactpress/bootstrap';
import { buildLocalizedListPageMetadata } from '@/lib/reactpress/siteMetadata';
import type { ITag } from '@fecommunity/reactpress-toolkit/types';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedListPageMetadata('tagTitle', undefined, { path: '/tags' });
}

export default async function TagsPage() {
  const bootstrap = await loadAppBootstrap('/tags');
  const tags = (bootstrap.tags ?? []) as ITag[];

  return <TagsClient tags={tags} />;
}
