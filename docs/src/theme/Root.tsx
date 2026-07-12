import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';
import Root from '@theme-original/Root';
import type { Props } from '@theme/Root';
import { Analytics } from '@vercel/analytics/react';
import { isFaqDocPath, shouldNoIndexPath } from '@site/src/seo/paths';
import { buildFaqPageJsonLd, FAQ_ENTRIES_EN, FAQ_ENTRIES_ZH } from '@site/src/seo/structuredData';

function RouteSeoHead(): React.JSX.Element | null {
  const { pathname } = useLocation();
  const { siteConfig, i18n } = useDocusaurusContext();
  const noIndex = shouldNoIndexPath(pathname);
  const faqPage = isFaqDocPath(pathname);

  if (!noIndex && !faqPage) {
    return null;
  }

  const pageUrl = `${siteConfig.url}${pathname}`.replace(/([^:]\/)\/+/g, '$1');
  const faqEntries = i18n.currentLocale === 'zh' ? FAQ_ENTRIES_ZH : FAQ_ENTRIES_EN;

  return (
    <Head>
      {noIndex ? <meta name="robots" content="noindex, follow" /> : null}
      {faqPage ? (
        <script type="application/ld+json">{JSON.stringify(buildFaqPageJsonLd(faqEntries, pageUrl))}</script>
      ) : null}
    </Head>
  );
}

export default function RootWrapper(props: Props): React.JSX.Element {
  return (
    <>
      <Root {...props} />
      <RouteSeoHead />
      <Analytics />
    </>
  );
}
