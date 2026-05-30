import Head from 'next/head';
import React from 'react';
import { SiteDocument, type SiteDocumentProps } from '@fecommunity/reactpress-toolkit/theme';
import Header from './Header';
import Footer from './Footer';

export type ThemeShellProps = Omit<SiteDocumentProps, 'header' | 'footer' | 'head'> & {
  head?: React.ReactNode;
};

/** SiteDocument wrapper with theme header/footer and background. */
export default function ThemeShell({ head, children, ...rest }: ThemeShellProps) {
  return (
    <SiteDocument
      header={<Header />}
      footer={<Footer />}
      globalCss="html, body { background-color: #f8f9fa; }"
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
