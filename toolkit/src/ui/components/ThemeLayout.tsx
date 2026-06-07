import React from 'react';
import { useThemeModBool } from '../context/ThemeRuntimeContext';

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
  const darkMode = useThemeModBool('darkMode', false);
  const mainContent = wrapContent ? (
    <div className={contentClassName} data-rp-part="content">
      {children}
    </div>
  ) : (
    children
  );

  return (
    <div
      className={className}
      data-rp-component="layout"
      {...(darkMode ? { 'data-rp-dark': 'true' } : {})}
    >
      {header}
      <main
        id="main-content"
        tabIndex={-1}
        className={mainClassName}
        data-rp-component="main"
      >
        {mainContent}
      </main>
      {footer}
    </div>
  );
}
