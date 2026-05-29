import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import {
  themeNotFound,
  themeOnDemandPaths,
  useRouteParam,
} from '@fecommunity/reactpress-toolkit/theme';
import ArchivePageView from '../../components/ArchivePageView';
import ThemeShell from '../../components/ThemeShell';
import { useThemeT } from '../../hooks/useThemeT';
import { fetchTagArchivePage, themeApi, withThemeStaticProps } from '../../lib/fetch';

interface TagProps {
  tag: string;
  articles: any[];
  articleTotal: number;
  tags: any[];
}

export default function TagPage({
  tag: tagProp,
  articles = [],
  articleTotal = 0,
  tags = [],
}: TagProps) {
  const router = useRouter();
  const t = useThemeT();
  const tag = useRouteParam(tagProp, 'tag');

  if (router.isFallback) {
    return (
      <ThemeShell head={<title>{t('common.loading', 'Loading…')}</title>}>
        <p className="loading-state">{t('common.loading', 'Loading…')}</p>
      </ThemeShell>
    );
  }

  const tagData = tags.find((item) => item?.value === tag);
  const tagName = tagData?.label ?? tag;
  const summary = t('tag.summary', '共 {count} 篇').replace('{count}', String(articleTotal));
  const heroBackground = articles.find((a) => a?.cover)?.cover as string | undefined;

  return (
    <ThemeShell
      head={
        <>
          <title>{tagName}</title>
          <meta name="description" content={summary} />
        </>
      }
    >
      <ArchivePageView
        title={tagName}
        description={summary}
        articles={articles}
        articleTotal={articleTotal}
        feedSource={{ type: 'tag', tag }}
        sidebarKind="tag"
        tags={tags}
        currentTag={tag}
        heroBackground={heroBackground}
        emptyMessage={t('empty.tag', '该标签下暂无文章。')}
      />
    </ThemeShell>
  );
}

export const getStaticPaths: GetStaticPaths = async () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps<TagProps> = async ({ params }) => {
  const slug = params?.tag;
  if (typeof slug !== 'string' || !slug) return themeNotFound();

  return withThemeStaticProps(
    'fetch tag archive failed',
    () => fetchTagArchivePage(themeApi, slug),
    () => ({ tag: slug, articles: [], articleTotal: 0, tags: [] }),
  );
};
