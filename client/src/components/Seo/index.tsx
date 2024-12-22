import React, { useContext } from 'react';
import Head from 'next/head';


import { GlobalContext } from '@/context/global';

export const Seo = () => {
  const { setting } = useContext(GlobalContext);

  return (
    <Head>
      <title>{setting.systemTitle}{setting.systemSubTitle ? ` - ${setting.systemSubTitle}` : ''}</title>
      <meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover,maximum-scale=1" />
      <meta name="copyright" content="Copyright (c) 2024 ReactPress(https://github.com/fecommunity/reactpress). All rights reserved." />
      <meta name="keyword" content={setting.seoKeyword} />
      <meta name="description" content={setting.seoDesc} />
      <link rel="shortcut icon" href={setting.systemFavicon} />
      <link href="//fonts.googleapis.com/css?family=Nunito:400,400i,700,700i&amp;display=swap" rel="stylesheet"></link>
    </Head>
  );
};
