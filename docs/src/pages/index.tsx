/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Head from '@docusaurus/Head';
import Home from '@site/src/pages/Home';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { translate } from '@docusaurus/Translate';

const Index = () => {
  const { siteConfig } = useDocusaurusContext();
  const title = `${siteConfig.title} · ${siteConfig.tagline}`;
  const description = translate({
    message:
      'ReactPress 3.0: one package, one minute to your own CMS. Zero-config install for blogs and content publishing.',
    id: 'home.meta.description',
  });

  return (
    <Layout title={siteConfig.title} description={description} wrapperClassName="homepage">
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="twitter:title" content={title} />
        <meta name="description" content={description} />
      </Head>
      <Home />
    </Layout>
  );
};

export default Index;
