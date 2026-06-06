'use client';

import AboutUs from '@/components/reactpress/AboutUs';
import ArticleRecommend from '@/components/reactpress/ArticleRecommend';
import DoubleColumnLayout from '@/components/reactpress/DoubleColumnLayout';
import Link from '@/components/Link';
import TagsWidget from '@/components/reactpress/TagsWidget';
import { TagIcon } from '@/src/utils/icons';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { useSiteCatalog, useSiteSetting } from '@fecommunity/reactpress-toolkit/theme';
import { useMemo } from 'react';

interface NavChild {
  key: string;
  label: string;
  description?: string;
  url?: string;
  icon?: string;
}

interface NavDetailClientProps {
  siteKey: string;
  navConfig?: {
    urlConfig?: Array<{ children?: NavChild[] }>;
  };
}

export default function NavDetailClient({ siteKey, navConfig }: NavDetailClientProps) {
  const { t } = useLocale();
  const setting = useSiteSetting();
  const { tags, siteConfig, globalSetting } = useSiteCatalog();

  const article = useMemo(() => {
    const urlConfig =
      navConfig?.urlConfig ??
      siteConfig?.nav?.urlConfig ??
      (globalSetting as { globalConfig?: { urlConfig?: Array<{ children?: NavChild[] }> } })?.globalConfig?.urlConfig ??
      [];
    const urlItem = urlConfig
      .flatMap((item) => item.children ?? [])
      .find((item) => item.key === siteKey);
    return {
      id: siteKey,
      title: urlItem?.label ?? t('unknownTitle'),
      cover: urlItem?.icon || (urlItem?.url ? `${urlItem.url}/favicon.ico` : ''),
      summary: urlItem?.description ?? '',
      url: urlItem?.url ?? '',
      tags: [
        { label: '网址导航', value: '' },
        { label: urlItem?.label ?? siteKey, value: siteKey },
      ],
    };
  }, [navConfig?.urlConfig, siteConfig?.nav?.urlConfig, globalSetting, siteKey, t]);

  return (
    <DoubleColumnLayout
      topNode={
        <nav className="mb-4 text-sm text-[var(--second-text-color)]">
          <Link href="/nav" className="text-[var(--primary-color)] no-underline hover:underline">
            {t('nav')}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--main-text-color)]">{article.title}</span>
        </nav>
      }
      leftNode={
        <div>
          <article className="overflow-hidden rounded-lg bg-[var(--bg-box)] p-4 shadow-[var(--box-shadow)] md:p-6">
            <h1 className="m-0 text-2xl font-semibold text-[var(--main-text-color)]">{article.title}</h1>
            <div className="mt-4 text-sm leading-relaxed text-[var(--second-text-color)]">
              {article.cover ? (
                <img src={article.cover} alt={t('articleCover')} className="mb-4 max-h-16 rounded" />
              ) : null}
              <p>{article.summary}</p>
              {article.url ? (
                <iframe
                  title={article.title}
                  src={article.url}
                  className="mt-4 min-h-[480px] w-full rounded border border-[var(--border-color)]"
                  allowFullScreen
                />
              ) : null}
            </div>
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              本站只做内容预览，不做任何信息存储，请注意您的账号和财产安全。如遇内容无法预览，请点击「打开网站」按钮预览。
            </div>
            {article.url ? (
              <button
                type="button"
                onClick={() => window.open(article.url, '_blank')}
                className="mt-4 rounded-lg bg-[var(--primary-color)] px-5 py-2 text-sm text-white"
              >
                打开网站 ›
              </button>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link
                  key={tag.value}
                  href={tag.value ? `/nav/${tag.value}` : '/nav'}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--border-color)] px-3 py-1 text-xs text-[var(--main-text-color)] no-underline hover:border-[var(--primary-color)]"
                >
                  <TagIcon className="h-3 w-3" />
                  {tag.label}
                </Link>
              ))}
            </div>
          </article>
          <div className="mt-6 overflow-hidden rounded-lg bg-[var(--bg-box)] p-4 shadow-[var(--box-shadow)]">
            <p className="mb-3 font-semibold text-[var(--main-text-color)]">{t('recommendToReading')}</p>
            <ArticleRecommend articleId={article.id} needTitle={false} />
          </div>
        </div>
      }
      rightNode={
        <div className="rp-sidebar-sticky sticky mb-4 w-72">
          <TagsWidget
            tags={tags as Parameters<typeof TagsWidget>[0]['tags']}
            animationMode
          />
          <AboutUs />
        </div>
      }
    />
  );
}
