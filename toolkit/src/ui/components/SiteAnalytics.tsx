import { useEffect } from 'react';

import { useSiteSetting } from '../context/SiteCatalogContext';

export interface SiteAnalyticsProps {
  children?: React.ReactNode;
}

/** Inject Google Analytics / Baidu Tongji scripts from site settings. */
export function SiteAnalytics({ children = null }: SiteAnalyticsProps) {
  const setting = useSiteSetting();

  useEffect(() => {
    const googleAnalyticsId = setting.googleAnalyticsId;
    if (!googleAnalyticsId) return undefined;

    const w = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    function gtag(...args: unknown[]) {
      w.dataLayer?.push(args);
    }
    w.gtag = gtag;
    gtag('js', new Date());
    gtag('config', googleAnalyticsId);

    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
    script.async = true;
    document.body?.appendChild(script);

    return () => {
      script.remove();
    };
  }, [setting.googleAnalyticsId]);

  useEffect(() => {
    const baiduAnalyticsId = setting.baiduAnalyticsId;
    if (!baiduAnalyticsId) return undefined;

    const hm = document.createElement('script');
    hm.src = `https://hm.baidu.com/hm.js?${baiduAnalyticsId}`;
    const s = document.getElementsByTagName('script')[0];
    s?.parentNode?.insertBefore(hm, s);

    return () => {
      hm.remove();
    };
  }, [setting.baiduAnalyticsId]);

  return children;
}
