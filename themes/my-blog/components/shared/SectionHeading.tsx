'use client';

import type { ReactNode } from 'react';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';

interface SectionHeadingProps {
  children: ReactNode;
  className?: string;
}

export default function SectionHeading({ children, className = '' }: SectionHeadingProps) {
  return (
    <div className={`rp-section-heading ${className}`.trim()}>
      <h2 className="rp-section-heading__title">{children}</h2>
    </div>
  );
}

export function EmptyState({ message }: { message?: string }) {
  const { t } = useLocale();
  return (
    <div className="rp-empty-state" role="status">
      <svg className="rp-empty-state__icon" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M9 12h6M12 9v6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
      <p className="rp-empty-state__text">{message ?? t('empty')}</p>
    </div>
  );
}
