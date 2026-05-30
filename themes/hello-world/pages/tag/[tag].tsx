import {
  ArchiveEmptyState,
  ArticleList,
  createArchiveGetStaticProps,
  fetchTagArchive,
  PageHeader,
  SiteDocument,
  SiteDocumentFallback,
  themeOnDemandPaths,
  useRouteParam,
} from '@fecommunity/reactpress-toolkit/theme';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Footer from '../../components/Footer';
import Header from '../../components/Header';
import PostEntry from '../../components/PostEntry';
import Sidebar from '../../components/Sidebar';

interface TagProps {
  tag: string;
  articles: Array<{
    id: string;
    title: string;
    summary?: string;
    publishAt?: string;
    category?: { label: string; value: string };
  }>;
  tags: Array<{ value: string; label: string; articleCount?: number }>;
}

const shellProps = {
  header: <Header />,
  footer: <Footer />,
  globalCss: 'html, body { background: #fff; }',
} as const;

export default function TagPage({ tag: tagProp, articles = [], tags = [] }: TagProps) {
  const router = useRouter();
  const tag = useRouteParam(tagProp, 'tag');

  if (router.isFallback) {
    return (
      <SiteDocumentFallback
        {...shellProps}
        head={<title>Loading…</title>}
      />
    );
  }

  const tagData = tags.find((t) => t.value === tag);
  const tagName = tagData?.label ?? tag;

  return (
    <SiteDocument
      {...shellProps}
      head={
        <>
          <title>{`Tag: ${tagName}`}</title>
          <meta name="description" content={`Articles tagged ${tagName}`} />
        </>
      }
    >
      <PageHeader
        className="section-title"
        title={`Tag: ${tagName}`}
        description={`${articles.length} article${articles.length === 1 ? '' : 's'}`}
        descriptionClassName="page-desc"
      />

      <div className="content-layout">
        <section>
          {articles.length > 0 ? (
            <ArticleList
              articles={articles}
              className="archives"
              renderArticle={(article) => <PostEntry key={article.id} article={article} />}
            />
          ) : (
            <ArchiveEmptyState
              message="No articles with this tag yet."
              renderBackLink={({ href, label }) => (
                <Link href={href}>
                  <a>{label}</a>
                </Link>
              )}
            />
          )}
        </section>
        <Sidebar tags={tags} currentTag={tag} />
      </div>
    </SiteDocument>
  );
}

export const getStaticPaths: GetStaticPaths = async () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps<TagProps> = createArchiveGetStaticProps(
  'tag',
  fetchTagArchive,
  (tag) => ({ tag, articles: [], tags: [] }),
);
