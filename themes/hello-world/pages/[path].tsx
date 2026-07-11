import {
  ArchiveEmptyState,
  fetchCmsPageProps,
  SiteDocument,
  SiteDocumentFallback,
  themeApi,
  themeOnDemandPaths,
  themeStaticNotFound,
  withThemeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import PageHead from '../components/PageHead';
import { THEME_SHELL } from '../components/ThemeShell';

interface CmsPageViewProps {
  page: {
    id: string;
    name: string;
    path: string;
    html?: string;
    publishAt?: string;
    views?: number;
  } | null;
}

const shellProps = THEME_SHELL;

export default function CmsPageView({ page }: CmsPageViewProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <SiteDocumentFallback
        {...shellProps}
        head={<PageHead title="Loading…" />}
      />
    );
  }

  if (!page) {
    return (
      <SiteDocument
        {...shellProps}
        head={<PageHead title="Page not found" description="The requested page could not be found." />}
      >
        <h1 className="section-title">Not found</h1>
        <ArchiveEmptyState
          message="This page does not exist or is not published."
          renderBackLink={({ href, label }) => <Link href={href}>{label}</Link>}
        />
      </SiteDocument>
    );
  }

  return (
    <SiteDocument
      {...shellProps}
      head={<PageHead title={page.name} description={page.name} />}
    >
      <article className="cms-page">
        <h1 className="section-title">{page.name}</h1>
        {page.html ? (
          <div className="article-prose" dangerouslySetInnerHTML={{ __html: page.html }} />
        ) : (
          <p className="empty-state">This page has no content yet.</p>
        )}
        <p className="cms-page-back">
          <Link href="/">← Back to archives</Link>
        </p>
      </article>
    </SiteDocument>
  );
}

export const getStaticPaths: GetStaticPaths = async () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps<CmsPageViewProps> = async ({ params }) => {
  const path = params?.path as string | undefined;
  const result = await withThemeStaticProps(
    'fetch cms page failed',
    () => fetchCmsPageProps(themeApi, path),
    { page: null },
  );
  if (!result.props.page) {
    return themeStaticNotFound();
  }
  return result;
};
