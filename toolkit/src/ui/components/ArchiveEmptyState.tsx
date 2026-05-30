import React from 'react';

export interface ArchiveEmptyStateProps {
  message: React.ReactNode;
  backHref?: string;
  backLabel?: React.ReactNode;
  className?: string;
  renderBackLink?: (props: { href: string; label: React.ReactNode }) => React.ReactNode;
}

/** Headless empty archive/search state with optional back link slot. */
export function ArchiveEmptyState({
  message,
  backHref = '/',
  backLabel = '← Back to archives',
  className = 'empty-state',
  renderBackLink,
}: ArchiveEmptyStateProps) {
  return (
    <>
      <p className={className} data-rp-component="archive-empty">
        {message}
      </p>
      {renderBackLink ? (
        <p>{renderBackLink({ href: backHref, label: backLabel })}</p>
      ) : null}
    </>
  );
}
