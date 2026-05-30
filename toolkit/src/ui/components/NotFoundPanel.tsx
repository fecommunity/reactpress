import React from 'react';

export interface NotFoundPanelProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  illustration?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/** Headless 404 / not-found content block (theme supplies styles). */
export function NotFoundPanel({
  title = 'Not found',
  subtitle,
  description,
  illustration,
  actions,
  className,
}: NotFoundPanelProps) {
  return (
    <div className={className} data-rp-component="not-found-panel">
      {illustration ? <div data-rp-part="illustration">{illustration}</div> : null}
      <h1 data-rp-part="title">{title}</h1>
      {subtitle != null && subtitle !== '' ? <h2 data-rp-part="subtitle">{subtitle}</h2> : null}
      {description != null && description !== '' ? (
        <p data-rp-part="description">{description}</p>
      ) : null}
      {actions ? <div data-rp-part="actions">{actions}</div> : null}
    </div>
  );
}
