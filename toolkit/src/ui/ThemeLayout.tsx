import React from 'react';

export interface ThemeLayoutProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
  contentClassName?: string;
  /** When true, wraps children in an inner content container (`data-rp-part="content"`). */
  wrapContent?: boolean;
}

/** Unstyled page shell: header + main (+ optional content wrapper) + footer. */
export function ThemeLayout({
  header,
  footer,
  children,
  className,
  mainClassName,
  contentClassName,
  wrapContent = false,
}: ThemeLayoutProps) {
  const mainContent = wrapContent ? (
    <div className={contentClassName} data-rp-part="content">
      {children}
    </div>
  ) : (
    children
  );

  return (
    <div className={className} data-rp-component="layout">
      {header}
      <main className={mainClassName} data-rp-component="main">
        {mainContent}
      </main>
      {footer}
    </div>
  );
}
