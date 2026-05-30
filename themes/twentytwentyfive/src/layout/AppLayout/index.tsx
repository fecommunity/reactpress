import { SiteSeo, SiteCatalogContext as GlobalContext, useToggle } from '@fecommunity/reactpress-toolkit/theme';
import React, { useContext, useEffect, useMemo } from 'react';

import { Footer } from '@components/Footer';
import { Header } from '@components/Header';
import { FloatButton } from 'antd';

import style from './index.module.scss';

interface IProps {
  backgroundColor?: string;
  needFooter?: boolean;
  hasBg?: boolean;
  needHeader?: boolean;
  children?: React.ReactNode;
}

export const AppLayout: React.FC<IProps> = ({ children, needFooter = true, needHeader = true, hasBg }) => {
  const { setting, pages, tags } = useContext(GlobalContext);
  const { systemBg } = setting;
  const [loaded, toggleLoaded] = useToggle(false);
  const bg = useMemo(
    () => `linear-gradient(to bottom, rgba(var(--rgb-bg-second), 0), rgba(var(--rgb-bg-second), 1)), url(${systemBg})`,
    [systemBg]
  );
  const customBg = hasBg || (!!systemBg && loaded);

  useEffect(() => {
    if (!systemBg) return;
    const img = document.createElement('img');
    img.onload = () => {
      toggleLoaded(true);
    };
    img.onerror = () => {
      toggleLoaded(false);
    };
    img.src = systemBg;
  }, [systemBg, toggleLoaded]);

  return (
    <div className={style.wrapper}>
      <SiteSeo>
        <link
          href="//fonts.googleapis.com/css?family=Nunito:400,400i,700,700i&amp;display=swap"
          rel="stylesheet"
        />
      </SiteSeo>
      {needHeader && <Header setting={setting} tags={tags} pages={pages} hasBg={customBg} />}
      <main className={style.main} style={{ backgroundColor: customBg ? 'transparent' : 'var(--bg-body)' }}>
        {children}
      </main>
      {systemBg && !hasBg && <div className={style.bg} style={{ backgroundImage: bg }}></div>}
      <FloatButton.BackTop />
      {needFooter && <Footer setting={setting} hasBg={customBg} />}
    </div>
  );
};
