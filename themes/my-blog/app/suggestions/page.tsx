import CmsPageClient from '@/components/reactpress/CmsPageClient';
import { fetchCmsPageProps, themeApi, withApiRetry } from '@fecommunity/reactpress-toolkit/theme/server';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export default async function SuggestionsPage() {
  try {
    const { page } = await withApiRetry(() => fetchCmsPageProps(themeApi, 'suggestions'));
    if (!page?.id || page.status !== 'publish') {
      notFound();
    }
    return <CmsPageClient page={page} />;
  } catch (error) {
    console.error('[my-blog] suggestions page fetch failed', error);
    notFound();
  }
}
