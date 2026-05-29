import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  NotFoundPanel,
  themeOnDemandPaths,
  useRouteParam,
} from '@fecommunity/reactpress-toolkit/theme';
import ThemeShell from '../../components/ThemeShell';
import SystemNotice from '../../components/SystemNotice';
import { useThemeT } from '../../hooks/useThemeT';
import { fetchPageByPath, themeApi, withThemeStaticProps } from '../../lib/fetch';

interface CustomPageProps {
  page: {
    id: string;
    name: string;
    path: string;
    html?: string;
    cover?: string;
    views?: number;
  } | null;
}

export default function CustomPage({ page }: CustomPageProps) {
  const router = useRouter();
  const t = useThemeT();
  const pageId = useRouteParam(page?.id, 'id');
  const [views, setViews] = useState(page?.views);

  useEffect(() => {
    setViews(page?.views);
  }, [page?.views]);

  useEffect(() => {
    if (!pageId || router.isFallback) return undefined;
    let cancelled = false;
    themeApi.page
      .updateViewsById(pageId)
      .then((res) => {
        if (cancelled) return;
        const data = (res as { data?: { views?: number } })?.data;
        if (typeof data?.views === 'number') setViews(data.views);
      })
      .catch(() => {
        /* non-fatal — custom pages must not call article view API */
      });
    return () => {
      cancelled = true;
    };
  }, [pageId, router.isFallback]);

  if (router.isFallback) {
    return (
      <ThemeShell head={<title>{t('common.loading', '加载中…')}</title>}>
        <p className="loading-state">{t('common.loading', '加载中…')}</p>
      </ThemeShell>
    );
  }

  if (!page) {
    return (
      <ThemeShell head={<title>{t('page.notFound.title', '页面不存在')}</title>}>
        <NotFoundPanel
          title={t('page.notFound.title', '页面不存在')}
          description={t('page.notFound.desc', '该页面不存在或未发布。')}
          actions={
            <Link href="/" className="back-home-link">
              {t('common.backHome', '← 返回首页')}
            </Link>
          }
        />
      </ThemeShell>
    );
  }

  return (
    <ThemeShell head={<title>{page.name}</title>}>
      <div className="site-container">
        <SystemNotice />
        <article className="article-content-page custom-page">
          {page.cover ? (
            <div className="article-cover">
              <img src={page.cover} alt="" />
            </div>
          ) : null}
          <header className="article-header">
            <h1 className="article-title-single">{page.name}</h1>
            {views != null ? (
              <p className="meta">
                {views} {t('common.viewsShort', '阅读')}
              </p>
            ) : null}
          </header>
          {page.html ? (
            <div
              className="article-body"
              data-rp-part="article-prose"
              dangerouslySetInnerHTML={{ __html: page.html }}
            />
          ) : null}
        </article>
      </div>
    </ThemeShell>
  );
}

export const getStaticPaths: GetStaticPaths = async () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps<CustomPageProps> = async ({ params }) => {
  const slug = params?.id as string | undefined;
  return withThemeStaticProps(
    'fetch custom page failed',
    async () => fetchPageByPath(themeApi, slug ?? ''),
    { page: null },
  );
};
