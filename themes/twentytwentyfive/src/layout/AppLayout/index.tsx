import { SiteSeo, SiteCatalogContext as GlobalContext, useToggle } from '@fecommunity/reactpress-toolkit/theme';
import dynamic from 'next/dynamic';
import React, { useContext, useEffect, useMemo } from 'react';

import { REACT_PRESS_HEADER_LOGO } from '@/assets/brand';

import { Footer } from '@components/Footer';
import { Header } from '@components/Header';
import style from './index.module.scss';

const BackTop = dynamic(() => import('@/ui/backtop').then((mod) => mod.BackTop), { ssr: false });

interface IProps {
  backgroundColor?: string;
  needFooter?: boolean;
  hasBg?: boolean;
  needHeader?: boolean;
  children?: React.ReactNode;
}

export const AppLayout: React.FC<IProps> = ({ children, needFooter = true, needHeader = true, hasBg }) => {
  const { setting, pages } = useContext(GlobalContext);
  const { systemBg } = setting;
  const [loaded, toggleLoaded] = useToggle(false);
  const bg = useMemo(
    () => `linear-gradient(to bottom, rgba(var(--rgb-bg-second), 0), rgba(var(--rgb-bg-second), 1)), url(${systemBg})`,
    [systemBg],
  );
  const customBg = hasBg || (!!systemBg && loaded);

  useEffect(() => {
    if (!systemBg) return;
    const img = document.createElement('img');
    img.onload = () => toggleLoaded(true);
    img.onerror = () => toggleLoaded(false);
    img.src = systemBg;
  }, [systemBg, toggleLoaded]);

  return (
    <div className={style.wrapper}>
      <SiteSeo>
        <link rel="preload" as="image" href={REACT_PRESS_HEADER_LOGO.src} fetchpriority="high" />
      </SiteSeo>
      {needHeader && <Header setting={setting} pages={pages} hasBg={customBg} />}
      <main id="main-content" className={style.main} style={{ backgroundColor: customBg ? 'transparent' : 'var(--bg-body)' }}>
        {children}
      </main>
      {systemBg && !hasBg && <div className={style.bg} style={{ backgroundImage: bg }} />}
      <BackTop />
      {needFooter && <Footer setting={setting} hasBg={customBg} />}
    </div>
  );
};
