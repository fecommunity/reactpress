import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TagsCloud from '../../components/TagsCloud';
import {
  categoryPath,
  formatPublishDate,
  SiteDocument,
  tagPath,
  themeApi,
  unpackOne,
} from '@fecommunity/reactpress-toolkit/theme';

interface ArticleProps {
  article: {
    id: string;
    title: string;
    summary?: string;
    html?: string;
    cover?: string;
    publishAt?: string;
    views?: number;
    category?: { label: string; value: string };
    tags?: Array<{ label: string; value: string }>;
  } | null;
}

export default function ArticlePage({ article }: ArticleProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <SiteDocument
        head={<title>Loading…</title>}
        header={<Header currentPage="article" />}
        footer={<Footer />}
        globalCss="html, body { background: #fff; }"
      >
        <p className="empty-state">Loading…</p>
      </SiteDocument>
    );
  }

  if (!article) {
    return (
      <SiteDocument
        head={<title>Article not found</title>}
        header={<Header />}
        footer={<Footer />}
        globalCss="html, body { background: #fff; }"
      >
        <h1 className="section-title">Not found</h1>
        <p className="empty-state">This article does not exist or was removed.</p>
        <p>
          <Link href="/">
            <a>← Back to archives</a>
          </Link>
        </p>
      </SiteDocument>
    );
  }

  return (
    <SiteDocument
      head={
        <>
          <title>{article.title}</title>
          <meta name="description" content={article.summary || article.title} />
        </>
      }
      header={<Header currentPage="article" />}
      footer={<Footer />}
      globalCss="html, body { background: #fff; }"
    >
      <article>
        <header className="article-header">
          <h1>{article.title}</h1>
          <p className="article-meta-bar">
            {article.publishAt ? (
              <time dateTime={article.publishAt}>{formatPublishDate(article.publishAt)}</time>
            ) : null}
            {article.category ? (
              <span>
                <Link href={categoryPath(article.category.value)}>
                  <a>{article.category.label}</a>
                </Link>
              </span>
            ) : null}
            {article.views != null ? <span>{article.views} views</span> : null}
          </p>
        </header>

        {article.cover ? (
          <div className="article-cover">
            <img src={article.cover} alt={article.title} />
          </div>
        ) : null}

        {article.html ? (
          <div className="article-prose" dangerouslySetInnerHTML={{ __html: article.html }} />
        ) : article.summary ? (
          <p>{article.summary}</p>
        ) : null}

        {article.tags && article.tags.length > 0 ? (
          <footer className="article-tags">
            <h2>Tags</h2>
            <div className="tags-cloud">
              {article.tags.map((tag) => (
                <Link key={tag.value} href={tagPath(tag.value)}>
                  <a>{tag.label}</a>
                </Link>
              ))}
            </div>
          </footer>
        ) : null}

        <p className="article-nav">
          <Link href="/">
            <a>← Back to archives</a>
          </Link>
        </p>
      </article>
    </SiteDocument>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: true,
});

export const getStaticProps: GetStaticProps<ArticleProps> = async ({ params }) => {
  const id = params?.id as string | undefined;
  if (!id) {
    return { props: { article: null }, revalidate: 60 };
  }

  try {
    const article = unpackOne(await themeApi.article.findById(id));
    return {
      props: { article: article || null },
      revalidate: 60,
    };
  } catch (error) {
    console.error('[hello-world] fetch article failed', error);
    return { props: { article: null }, revalidate: 60 };
  }
};
