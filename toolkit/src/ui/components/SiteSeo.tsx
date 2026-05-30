import Head from 'next/head';
import React from 'react';

import { useSiteSetting } from '../context/SiteCatalogContext';

export interface SiteSeoProps {
  /** Extra `<Head>` children after default meta tags. */
  children?: React.ReactNode;
  /** Override favicon from site settings. */
  favicon?: string;
  /** Override meta keywords. */
  keywords?: string;
  /** Override meta description. */
  description?: string;
}

/** Inject default site meta tags from catalog `setting`. */
export function SiteSeo({ children, favicon, keywords, description }: SiteSeoProps) {
  const setting = useSiteSetting();

  return (
    <Head>
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1.0,viewport-fit=cover,maximum-scale=1"
      />
      <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
      <link rel="shortcut icon" href={favicon ?? setting.systemFavicon} />
      <link rel="apple-touch-icon" href={favicon ?? setting.systemFavicon} />
      <meta name="keywords" content={keywords ?? setting.seoKeyword} />
      <meta name="description" content={description ?? setting.seoDesc} />
      <meta name="robots" content="max-image-preview:large" />
      {children}
    </Head>
  );
}
