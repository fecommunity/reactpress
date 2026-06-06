'use client';

import ArticleRecommend from '@/components/article/ArticleRecommend';
import DoubleColumnLayout from '@/components/layout/DoubleColumnLayout';
import Link from '@/components/shared/Link';
import SectionHeading from '@/components/shared/SectionHeading';
import { ChevronLeftIcon, ChevronRightIcon } from '@/lib/utils/icons';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { useSiteCatalog } from '@fecommunity/reactpress-toolkit/theme';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

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

function getIconUrl(item: { icon?: string; url?: string }) {
  if (item?.icon?.trim()) return item.icon.trim();
  if (item?.url) return `${item.url.replace(/\/$/, '')}/favicon.ico`;
  return '';
}

function plainDescription(value?: string) {
  if (!value?.trim()) return '';
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function SiteIcon({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="rp-nav-detail__icon-fallback" aria-hidden>
        {label.slice(0, 1)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={56}
      height={56}
      className="rp-nav-detail__icon-img"
      onError={() => setFailed(true)}
    />
  );
}

export default function NavDetailClient({ siteKey, navConfig }: NavDetailClientProps) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { siteConfig, globalSetting } = useSiteCatalog();
  const backLabel = locale === 'zh' ? '返回' : 'Back';

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/search');
  }, [router]);

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
      cover: getIconUrl(urlItem ?? {}),
      summary: plainDescription(urlItem?.description),
      url: urlItem?.url ?? '',
    };
  }, [navConfig?.urlConfig, siteConfig?.nav?.urlConfig, globalSetting, siteKey, t]);

  const displayUrl = article.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <DoubleColumnLayout
      className="rp-nav-detail-page"
      topNode={
        <nav className="rp-nav-detail__crumb" aria-label="breadcrumb">
          <Link href="/search" className="rp-nav-detail__crumb-link">
            {t('searchArticle')}
          </Link>
          <ChevronRightIcon size={14} className="rp-nav-detail__crumb-sep" aria-hidden />
          <span className="rp-nav-detail__crumb-current">{article.title}</span>
        </nav>
      }
      leftNode={
        <div className="rp-nav-detail">
          <article className="rp-nav-detail__card">
            <header className="rp-nav-detail__header">
              <div className="rp-nav-detail__header-main">
                <div className="rp-nav-detail__icon">
                  <SiteIcon src={article.cover} label={article.title} />
                </div>
                <div className="rp-nav-detail__meta">
                  <h1 className="rp-nav-detail__title">{article.title}</h1>
                  {displayUrl ? (
                    <p className="rp-nav-detail__url" title={article.url}>
                      {displayUrl}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="rp-nav-detail__actions">
                {article.url ? (
                  <button
                    type="button"
                    onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                    className="rp-nav-detail__btn rp-nav-detail__btn--primary"
                  >
                    {t('navOpenSite')}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleBack}
                  className="rp-nav-detail__btn rp-nav-detail__btn--ghost"
                >
                  <ChevronLeftIcon size={14} aria-hidden />
                  {backLabel}
                </button>
              </div>
            </header>

            {article.summary ? <p className="rp-nav-detail__summary">{article.summary}</p> : null}

            <div className="rp-nav-detail__disclaimer" role="note">
              {t('navPreviewDisclaimer')}
            </div>

            {article.url ? (
              <div className="rp-nav-detail__preview">
                <iframe
                  title={article.title}
                  src={article.url}
                  className="rp-nav-detail__iframe"
                  allowFullScreen
                />
              </div>
            ) : null}
          </article>

          <section className="rp-nav-detail__recommend">
            <SectionHeading>{t('recommendToReading')}</SectionHeading>
            <ArticleRecommend articleId={article.id} needTitle={false} />
          </section>
        </div>
      }
    />
  );
}
