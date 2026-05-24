import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PostEntry from '../../components/PostEntry';
import Sidebar from '../../components/Sidebar';
import {
  ArticleList,
  fetchTagArchive,
  SiteDocument,
  themeApi,
  themeNotFound,
  themeOnDemandPaths,
  themeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';

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

export default function TagPage({ tag: tagProp, articles = [], tags = [] }: TagProps) {
  const router = useRouter();
  const tag = tagProp ?? (typeof router.query.tag === 'string' ? router.query.tag : '');

  if (router.isFallback) {
    return (
      <SiteDocument
        head={<title>Loading…</title>}
        header={<Header currentPage="tag" />}
        footer={<Footer />}
        globalCss="html, body { background: #fff; }"
      >
        <p className="empty-state">Loading…</p>
      </SiteDocument>
    );
  }

  const tagData = tags.find((t) => t.value === tag);
  const tagName = tagData?.label ?? tag;

  return (
    <SiteDocument
      head={
        <>
          <title>{`Tag: ${tagName}`}</title>
          <meta name="description" content={`Articles tagged ${tagName}`} />
        </>
      }
      header={<Header currentPage="tag" />}
      footer={<Footer />}
      globalCss="html, body { background: #fff; }"
    >
      <h1 className="section-title">Tag: {tagName}</h1>
      <p className="page-desc">
        {articles.length} article{articles.length === 1 ? '' : 's'}
      </p>

      <div className="content-layout">
        <section>
          {articles.length > 0 ? (
            <ArticleList
              articles={articles}
              className="archives"
              renderArticle={(article) => <PostEntry key={article.id} article={article} />}
            />
          ) : (
            <>
              <p className="empty-state">No articles with this tag yet.</p>
              <p>
                <Link href="/">
                  <a>← Back to archives</a>
                </Link>
              </p>
            </>
          )}
        </section>
        <Sidebar tags={tags} currentTag={tag} />
      </div>
    </SiteDocument>
  );
}

export const getStaticPaths: GetStaticPaths = async () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps<TagProps> = async ({ params }) => {
  const tag = params?.tag as string | undefined;
  if (!tag) return themeNotFound();

  try {
    const data = await fetchTagArchive(themeApi, tag);
    return themeStaticProps(data);
  } catch (error) {
    console.error('[hello-world] fetch tag failed', error);
    return themeStaticProps({ tag, articles: [], tags: [] });
  }
};
