import PageHead from '@/components/PageHead';
import { HtmlContent } from '@fecommunity/reactpress-toolkit/ui/content';
import { NextPage } from 'next';

interface CmsPage {
  id: string;
  title: string;
  html?: string;
  content?: string;
}

interface PageProps {
  page: CmsPage | null;
}

const CmsPageView: NextPage<PageProps> = ({ page }) => {
  if (!page) {
    return (
      <>
        <PageHead title="Not found" />
        <div className="site-container py-12">
          <p>Page not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title={page.title} />
      <div className="site-container max-w-3xl py-8">
        <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
        <div className="prose-content mt-6">
          {page.html ? (
            <HtmlContent html={page.html} />
          ) : page.content ? (
            <p>{page.content}</p>
          ) : null}
        </div>
      </div>
    </>
  );
};

CmsPageView.getInitialProps = async ({ query }) => {
  const id = typeof query?.id === 'string' ? query.id : '';
  if (!id) return { page: null, needLayoutFooter: true };

  try {
    const { fetchCmsPage, themeApi } = await import('@fecommunity/reactpress-toolkit/theme');
    const { page } = await fetchCmsPage(themeApi, id);
    return { page: page as CmsPage, needLayoutFooter: true };
  } catch {
    return { page: null, needLayoutFooter: true };
  }
};

export default CmsPageView;
