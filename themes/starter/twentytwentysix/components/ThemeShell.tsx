import Head from 'next/head';
import React from 'react';
import { SiteDocument, type SiteDocumentProps } from '@fecommunity/reactpress-toolkit/theme';
import { ColorSchemeProvider } from '../contexts/ColorSchemeContext';
import Header from './Header';
import Footer from './Footer';

export type ThemeShellProps = Omit<SiteDocumentProps, 'header' | 'footer' | 'head'> & {
  head?: React.ReactNode;
};

function ThemeShellDocument({ head, children, ...rest }: ThemeShellProps) {
  return (
    <SiteDocument
      className="theme-gaoredu theme-shell"
      wrapContent={false}
      header={<Header />}
      footer={<Footer />}
      globalCss="html, body { margin: 0; min-height: 100%; }"
      {...rest}
      head={
        <Head>
          {head}
          <link rel="icon" href="/favicon.ico" />
        </Head>
      }
    >
      {children}
    </SiteDocument>
  );
}

/** SiteDocument wrapper with gaoredu shell + shared color-scheme context. */
export default function ThemeShell(props: ThemeShellProps) {
  return (
    <ColorSchemeProvider>
      <ThemeShellDocument {...props} />
    </ColorSchemeProvider>
  );
}
