import DoubleColumnLayout from '@/components/DoubleColumnLayout';
import PageHead from '@/components/PageHead';
import PostEntry from '@/components/PostEntry';
import Sidebar from '@/components/Sidebar';
import {
  ArchiveEmptyState,
  ArticleList,
  fetchTagArchive,
  PageHeader,
  themeApi,
  useRouteParam,
} from '@fecommunity/reactpress-toolkit/theme';
import Link from 'next/link';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';

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

const TagPage: NextPage<TagProps> = ({ tag: tagProp, articles = [], tags = [] }) => {
  const router = useRouter();
  const t = useTranslations();
  const tag = useRouteParam(tagProp, 'tag');

  if (router.isFallback) {
    return (
      <>
        <PageHead title={t('loading') || 'Loading…'} />
        <div className="site-container py-16 text-center text-muted-foreground">
          {t('loading') || 'Loading…'}
        </div>
      </>
    );
  }

  const tagData = tags.find((item) => item.value === tag);
  const tagName = tagData?.label ?? tag;

  return (
    <>
      <PageHead title={`${t('tagTitle') || 'Tag'}: ${tagName}`} />
      <DoubleColumnLayout
        top={
          <PageHeader
            title={`${t('tagTitle') || 'Tag'}: ${tagName}`}
            titleClassName="text-2xl font-bold tracking-tight"
            description={`${articles.length} ${t('articles') || 'articles'}`}
            descriptionClassName="text-muted-foreground"
          />
        }
        main={
          articles.length > 0 ? (
            <ArticleList
              articles={articles}
              className="space-y-6"
              renderArticle={(article) => <PostEntry key={article.id} article={article} />}
            />
          ) : (
            <ArchiveEmptyState
              message={t('noArticlesWithTag') || 'No articles with this tag yet.'}
              renderBackLink={({ href, label }) => (
                <Link href={href}>
                  <a className="btn-outline mt-4 inline-flex">{label}</a>
                </Link>
              )}
            />
          )
        }
        sidebar={<Sidebar tags={tags} currentTag={tag} />}
      />
    </>
  );
};

TagPage.getInitialProps = async (ctx) => {
  const raw = ctx.query.tag;
  const tag = Array.isArray(raw) ? raw[0] : raw;
  if (!tag) {
    return { tag: '', articles: [], tags: [], needLayoutFooter: true };
  }
  try {
    const data = await fetchTagArchive(themeApi, tag);
    return { ...data, needLayoutFooter: true };
  } catch (error) {
    console.error('[twentytwentysix] fetch tag archive failed', error);
    return { tag, articles: [], tags: [], needLayoutFooter: true };
  }
};

export default TagPage;
