import React, { useContext } from 'react';

import { GlobalContext } from '@/context/global';

import Category from './Category';
import styles from './index.module.scss';
import NavCard from './NavCard';

export interface CategoryItem {
  label: string;
  key: string;
  icon?: React.ReactNode;
  description?: string;
  type?: string;
  url?: string;
  children?: CategoryItem[];
}

interface NavCardProps {
  dataSource?: CategoryItem[];
}

const NavCardPage: React.FC<NavCardProps> = (props) => {
  const { siteConfig, globalSetting } = useContext(GlobalContext);
  const dataSource =
    props?.dataSource ||
    siteConfig?.nav?.urlConfig ||
    globalSetting?.globalConfig?.urlConfig;
  return (
    <div className={styles.navCardWrapper}>
      <Category dataSource={dataSource} />
      <NavCard dataSource={dataSource} />
    </div>
  );
};

export default NavCardPage;
