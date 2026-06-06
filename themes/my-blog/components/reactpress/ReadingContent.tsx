'use client';

import { ContentStylesLoader } from '@/components/reactpress/ContentStylesLoader';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { HtmlContent } from '@fecommunity/reactpress-toolkit/ui/content';
import { memo } from 'react';

interface ReadingContentProps {
  content?: string;
  className?: string;
}

const ArticleBody = memo(function ArticleBody({
  content,
  className,
  copyLabel,
  copySuccessLabel,
}: {
  content?: string;
  className: string;
  copyLabel: string;
  copySuccessLabel: string;
}) {
  return (
    <HtmlContent
      content={content}
      className={className}
      copyLabel={copyLabel}
      copySuccessLabel={copySuccessLabel}
    />
  );
});

export default function ReadingContent({
  content,
  className = 'markdown rp-html-content max-w-none',
}: ReadingContentProps) {
  const { t } = useLocale();

  return (
    <>
      <ContentStylesLoader />
      <ArticleBody
        content={content}
        className={className}
        copyLabel={t('copy')}
        copySuccessLabel={t('copySuccess')}
      />
    </>
  );
}
