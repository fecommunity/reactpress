import type { Tag } from '@docusaurus/types';
import { buildOrganizationGraph } from './structuredData';

const DEFAULT_SITE_URL = 'https://docs.gaoredu.com';
const GOOGLE_ADSENSE_CLIENT = 'ca-pub-5349318179336721';

export function getSiteUrl(): string {
  return process.env.DOCS_SITE_URL?.trim() || DEFAULT_SITE_URL;
}

/** Site-wide head tags. Per-page hreflang and og:locale are handled by Docusaurus i18n. */
export function buildGlobalHeadTags(siteUrl: string): Tag[] {
  const baseUrl = siteUrl.replace(/\/$/, '');

  return [
    {
      tagName: 'script',
      attributes: {
        async: 'true',
        src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_CLIENT}`,
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: { rel: 'apple-touch-icon', href: `${baseUrl}/img/apple-touch-icon.png` },
    },
    { tagName: 'meta', attributes: { property: 'og:type', content: 'website' } },
    { tagName: 'meta', attributes: { property: 'og:site_name', content: 'ReactPress' } },
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify(buildOrganizationGraph(baseUrl)),
    },
  ];
}
