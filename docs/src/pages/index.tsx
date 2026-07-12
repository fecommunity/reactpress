/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Head from '@docusaurus/Head';
import { translate } from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Home from '@site/src/components/Home';
import { buildFaqPageJsonLd, FAQ_ENTRIES_EN, FAQ_ENTRIES_ZH } from '@site/src/seo/structuredData';
import Layout from '@theme/Layout';

const Index = () => {
  const { siteConfig, i18n } = useDocusaurusContext();
  const canonicalUrl = `${siteConfig.url}${siteConfig.baseUrl}`.replace(/\/$/, '') + '/';
  const title = translate({
    id: 'home.meta.title',
    message: 'ReactPress — Publish with React. Ship like WordPress.',
  });
  const description = translate({
    message:
      'Official ReactPress docs — self-hosted React publishing platform with WordPress-style editing, headless REST, Next.js themes, plugins, and desktop. One CLI, ~60 seconds to live.',
    id: 'home.meta.description',
  });
  const faqEntries = i18n.currentLocale === 'zh' ? FAQ_ENTRIES_ZH : FAQ_ENTRIES_EN;
  const faqJsonLd = buildFaqPageJsonLd(faqEntries, canonicalUrl);

  return (
    <Layout description={description} wrapperClassName="homepage">
      <Head>
        <title>{title}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="og:image" content={`${siteConfig.url}/img/reactpress-social-card.png`} />
        <meta property="twitter:image" content={`${siteConfig.url}/img/reactpress-social-card.png`} />
        <meta name="description" content={description} />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Head>
      <Home />
    </Layout>
  );
};

export default Index;
