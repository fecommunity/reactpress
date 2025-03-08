/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import Head from '@docusaurus/Head';

import Layout from '@theme/Layout';

import Home from '@site/src/pages/Home';

const Index = () => {
  return (
    <Layout
      description="A framework for building native apps using React"
      wrapperClassName="homepage">
      <Head>
        <title>ReactPress - 一个基于Next.js的博客&CMS系统。</title>
        <meta
          property="og:title"
          content="ReactPress - 一个基于Next.js的博客&CMS系统。"
        />
        <meta
          property="twitter:title"
          content="ReactPress - 一个基于Next.js的博客&CMS系统。"
        />
      </Head>
      <Home />
    </Layout>
  );
};

export default Index;
