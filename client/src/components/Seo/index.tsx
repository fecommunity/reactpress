import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';

import { GlobalContext } from '@/context/global';

export const Seo = () => {
  const { setting } = useContext(GlobalContext);

  return (
    <Helmet>
      <title>{setting.systemTitle}</title>
      <meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover,maximum-scale=1" />
      <meta name="keyword" content={setting.seoKeyword} />
      <meta name="description" content={setting.seoDesc} />
      <link rel="shortcut icon" href={setting.systemFavicon} />
      <link href="//fonts.googleapis.com/css?family=Nunito:400,400i,700,700i&amp;display=swap" rel="stylesheet"></link>
    </Helmet>
  );
};
