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

import PageHead from '../../components/PageHead';
import PostEntry from '../../components/PostEntry';
import Sidebar from '../../components/Sidebar';
import { THEME_SHELL } from '../../components/ThemeShell';

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

const shellProps = THEME_SHELL;

export default function TagPage({ tag: tagProp, articles = [], tags = [] }: TagProps) {
  const router = useRouter();
  const tag = useRouteParam(tagProp, 'tag');

  if (router.isFallback) {
    return (
      <SiteDocumentFallback
        {...shellProps}
        head={<PageHead title="Loading…" />}
      />
    );
  }

  const tagData = tags.find((t) => t.value === tag);
  const tagName = tagData?.label ?? tag;

  return (
    <SiteDocument
      {...shellProps}
      head={
        <PageHead
          title={`Tag: ${tagName}`}
          description={`Articles tagged ${tagName}.`}
        />
      }
    >
      <PageHeader
        className="archive-header"
        titleClassName="section-title"
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
