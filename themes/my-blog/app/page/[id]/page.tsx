import PageTitle from '@/components/PageTitle';
import { fetchCmsPageProps, themeApi, withApiRetry } from '@fecommunity/reactpress-toolkit/theme/server';
import { notFound } from 'next/navigation';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CmsPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const { page } = await withApiRetry(() => fetchCmsPageProps(themeApi, id));
    if (!page?.id || page.status !== 'publish') {
      notFound();
    }

    return (
      <article className="pt-6 pb-8">
        <PageTitle>{page.title}</PageTitle>
        <div
          className="prose dark:prose-invert max-w-none pt-8 markdown"
          dangerouslySetInnerHTML={{ __html: page.html ?? '' }}
        />
      </article>
    );
  } catch (error) {
    console.error('[my-blog] cms page fetch failed', error);
    notFound();
  }
}
