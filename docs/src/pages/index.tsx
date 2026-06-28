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
import Layout from '@theme/Layout';

const Index = () => {
  const { siteConfig } = useDocusaurusContext();
  const canonicalUrl = `${siteConfig.url}${siteConfig.baseUrl}`.replace(/\/$/, '') + '/';
  const title = `${siteConfig.title} · ${siteConfig.tagline}`;
  const description = translate({
    message:
      'ReactPress 4.0: plugins, desktop client, and npm themes on a zero-config CMS. One package, your site in about a minute.',
    id: 'home.meta.description',
  });

  return (
    <Layout title={siteConfig.title} description={description} wrapperClassName="homepage">
      <Head>
        <title>{title}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta name="description" content={description} />
      </Head>
      <Home />
    </Layout>
  );
};

export default Index;
