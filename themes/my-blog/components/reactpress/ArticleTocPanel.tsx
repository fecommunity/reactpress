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
    <div className="rp-sidebar-sticky sticky mb-4 w-72 overflow-hidden rounded-lg bg-[var(--bg-box)] shadow-[var(--box-shadow)]">
      <header className="border-b border-[var(--border-color)] p-4 font-bold text-[var(--main-text-color)]">
        {t('toc')}
      </header>
      <div className="max-h-[80vh] overflow-y-auto p-2">
        <ArticleToc items={tocs} showTitle={false} />
      </div>
    </div>
  );
}
