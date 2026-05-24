import React from 'react';
import { ThemeLayout } from './ThemeLayout';
import { ThemeCssVars } from './ThemeCssVars';
import { BaseGlobalStyles } from './BaseGlobalStyles';

export interface SiteDocumentProps {
  /** Pass Next `<Head>` from `next/head` in the theme page. */
  head?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
  contentClassName?: string;
  wrapContent?: boolean;
  globalCss?: string;
  skipBaseStyles?: boolean;
  /** Skip CSS vars when `createThemeApp` already injects `ThemeCssVars` in `_app`. */
  skipCssVars?: boolean;
}

/**
 * WordPress-style shell: head slot + header + main + footer (like `get_header()` / `get_footer()`).
 */
export function SiteDocument({
  head,
  header,
  footer,
  children,
  className = 'container',
  mainClassName = 'main',
  contentClassName = 'content-wrapper',
  wrapContent = true,
  globalCss,
  skipBaseStyles = false,
  skipCssVars = true,
}: SiteDocumentProps) {
  return (
    <>
      {head}
      {!skipCssVars ? <ThemeCssVars /> : null}
      <ThemeLayout
        className={className}
        mainClassName={mainClassName}
        contentClassName={contentClassName}
        wrapContent={wrapContent}
        header={header}
        footer={footer}
      >
        {children}
      </ThemeLayout>
      {!skipBaseStyles ? (
        <BaseGlobalStyles extra={globalCss} />
      ) : globalCss ? (
        <style dangerouslySetInnerHTML={{ __html: globalCss }} />
      ) : null}
    </>
  );
}
