'use client';

import { useSiteCatalog } from '@fecommunity/reactpress-toolkit/theme';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { LocaleTime } from '@fecommunity/reactpress-toolkit/ui/content';

const CC_LICENSE_URL = 'https://creativecommons.org/licenses/by-nc/3.0/cn/deed.zh';

interface ArticleCopyrightBarProps {
  publishAt: string;
  className?: string;
}

export default function ArticleCopyrightBar({ publishAt, className = '' }: ArticleCopyrightBarProps) {
  const { t } = useLocale();
  const { locale } = useSiteCatalog();

  return (
    <div className={`rp-article-meta-footer ${className}`.trim()}>
      <p className="rp-article-meta-line">
        <span className="rp-article-meta-item">
          {t('publishAt')}
          <LocaleTime date={publishAt} locale={locale} />
        </span>
        <span className="rp-article-meta-sep" aria-hidden>
          ·
        </span>
        <span className="rp-article-meta-item">
          {t('copyrightInfo')}
          <a
            href={CC_LICENSE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rp-inline-link"
          >
            {t('copyrightContent')}
          </a>
        </span>
      </p>
    </div>
  );
}
