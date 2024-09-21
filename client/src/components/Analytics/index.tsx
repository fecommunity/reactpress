import { useContext, useEffect } from 'react';

import { GlobalContext } from '@/context/global';

export const Analytics = (props) => {
  const { setting } = useContext(GlobalContext);

  useEffect(() => {
    const googleAnalyticsId = setting.googleAnalyticsId;

    if (!googleAnalyticsId) {
      return;
    }

    // @ts-ignore
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      // @ts-ignore
      window.dataLayer.push(arguments); // eslint-disable-line prefer-rest-params
    }
    // @ts-ignore
    gtag('js', new Date());
    // @ts-ignore
    gtag('config', googleAnalyticsId);

    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
    script.async = true;

    if (document.body) {
      document.body.appendChild(script);
    }
  }, [setting.googleAnalyticsId]);

  useEffect(() => {
    const baiduAnalyticsId = setting.baiduAnalyticsId;

    if (!baiduAnalyticsId) {
      return;
    }

    const hm = document.createElement('script');
    hm.src = `https://hm.baidu.com/hm.js?${baiduAnalyticsId}`;
    const s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(hm, s);
  }, [setting.baiduAnalyticsId]);

  return props.children || null;
};
