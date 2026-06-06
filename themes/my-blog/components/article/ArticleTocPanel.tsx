'use client';

import { ArticleToc, type TocItem } from '@fecommunity/reactpress-toolkit/ui/content';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';

interface ArticleTocPanelProps {
  tocs: TocItem[];
}

export default function ArticleTocPanel({ tocs }: ArticleTocPanelProps) {
  const { t } = useLocale();
  if (!tocs.length) return null;

  return (
    <nav className="rp-toc-panel rp-toc-panel--minimal" aria-label={t('toc')}>
      <ArticleToc items={tocs} showTitle={false} maxHeight="none" indentStep={6} />
    </nav>
  );
}
