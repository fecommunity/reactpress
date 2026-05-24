import React from 'react';

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

/** Unstyled archive / page title block (WP `the_archive_title` pattern). */
export function PageHeader({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}: PageHeaderProps) {
  return (
    <header className={className} data-rp-component="page-header">
      <h1 className={titleClassName}>{title}</h1>
      {description != null && description !== '' ? (
        <p className={descriptionClassName}>{description}</p>
      ) : null}
    </header>
  );
}
