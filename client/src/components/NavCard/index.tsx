import React, { useState } from 'react';
import styles from './index.module.scss';
import Category from './Category';
import NavCard from './NavCard';


export interface CategoryItem {
  label: string;
  key: string;
  icon?: React.ReactNode;
  description?: string;
  type?: string;
  children?: CategoryItem[];
}

interface NavCardProps {
  dataSource: CategoryItem[];
}

const NavCardPage: React.FC<NavCardProps> = (props) => {
  const { dataSource } = props;
  return (
    <div className={styles.navCardWrapper}>
      <Category dataSource={dataSource} />
      <NavCard dataSource={dataSource} />
    </div>
  );
};

export default NavCardPage;
