'use client';

import Link from '@/components/shared/Link';
import { getRandomColor } from '@/lib/utils/comment';
import { useSiteCatalog } from '@fecommunity/reactpress-toolkit/theme';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { LocaleTime } from '@fecommunity/reactpress-toolkit/ui/content';
import { resolveImageUrl, useSiteSetting } from '@fecommunity/reactpress-toolkit/theme';

const CC_LICENSE_URL = 'https://creativecommons.org/licenses/by-nc/3.0/cn/deed.zh';

interface ArticleCopyrightBarProps {
  publishAt: string;
  className?: string;
}

function isImageLogo(logo: string) {
  return logo.startsWith('http') || logo.startsWith('/') || /\.(svg|png|jpe?g|gif|webp)(\?.*)?$/i.test(logo);
}

function AuthorAvatar({ name, logo }: { name: string; logo?: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || 'A';

  if (logo && logo.includes('<')) {
    return (
      <span
        className="rp-article-author-avatar__brand"
        dangerouslySetInnerHTML={{ __html: logo }}
      />
    );
  }

  if (logo && isImageLogo(logo)) {
    return (
      <img
        src={resolveImageUrl(logo, 'medium')}
        alt=""
        className="rp-article-author-avatar__img"
      />
    );
  }

  return (
    <span
      className="rp-article-author-avatar__fallback"
      style={{ backgroundColor: getRandomColor(name) }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

export default function ArticleCopyrightBar({ publishAt, className = '' }: ArticleCopyrightBarProps) {
  const { t } = useLocale();
  const { locale } = useSiteCatalog();
  const setting = useSiteSetting();

  const authorName = setting.systemTitle?.trim() || 'ReactPress';
  const authorBio = setting.systemSubTitle?.trim();
  const authorLogo = setting.systemLogo?.trim();

  return (
    <div className={`rp-article-author-footer ${className}`.trim()}>
      <div className="rp-article-author-panel">
        <div className="rp-article-author-main">
          <Link href="/" className="rp-article-author-avatar" aria-label={authorName}>
            <AuthorAvatar name={authorName} logo={authorLogo} />
          </Link>

          <div className="rp-article-author-info">
            <span className="rp-article-author-label">
              {locale === 'zh' ? '作者' : 'Author'}
            </span>
            <Link href="/" className="rp-article-author-name">
              {authorName}
            </Link>
            {authorBio ? <p className="rp-article-author-bio">{authorBio}</p> : null}
          </div>

          <Link href="/" className="rp-article-author-cta">
            {t('home')}
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="rp-article-author-meta">
          <span>
            {t('publishAt')}
            <LocaleTime date={publishAt} locale={locale} />
          </span>
          <span className="rp-article-author-meta__sep" aria-hidden>
            ·
          </span>
          <span>
            {t('copyrightInfo')}
            <a
              href={CC_LICENSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rp-article-author-license"
            >
              {t('copyrightContent')}
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
