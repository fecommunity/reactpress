'use client';

import { ContentStylesLoader } from '@/components/reactpress/ContentStylesLoader';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { HtmlContent } from '@fecommunity/reactpress-toolkit/ui/content';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ReadingContentProps {
  content?: string;
  className?: string;
}

export default function ReadingContent({
  content,
  className = 'markdown rp-html-content max-w-none',
}: ReadingContentProps) {
  const { t } = useLocale();
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  const handleCopy = useCallback(() => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastVisible(true);
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
      toastTimerRef.current = null;
    }, 2000);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  return (
    <>
      <ContentStylesLoader />
      <HtmlContent
        content={content}
        className={className}
        copyLabel={t('copy')}
        onCopy={handleCopy}
      />
      {toastVisible ? (
        <div className="rp-copy-toast" role="status" aria-live="polite">
          {t('copySuccess')}
        </div>
      ) : null}
    </>
  );
}
