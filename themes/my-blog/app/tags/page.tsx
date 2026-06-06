import TagsClient from './TagsClient';
import { loadAppBootstrap } from '@/src/reactpress/bootstrap';
import { buildListPageMetadata } from '@/src/reactpress/siteMetadata';
import type { ITag } from '@fecommunity/reactpress-toolkit/types';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildListPageMetadata('标签');
}

export default async function TagsPage() {
  const bootstrap = await loadAppBootstrap('/tags');
  const tags = (bootstrap.tags ?? []) as ITag[];

  return <TagsClient tags={tags} />;
}
