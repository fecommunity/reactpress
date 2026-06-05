import {
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@/icons';
import { Button, Menu } from '@/ui';
import React, { useMemo, useState } from 'react';

import { useColorMode } from '@fecommunity/reactpress-toolkit/theme';
import { getIconByName } from '@/utils';

import { CategoryItem } from '.';
import styles from './index.module.scss';

interface CategoryProps {
  dataSource: CategoryItem[];
}

const Category: React.FC<CategoryProps> = (props) => {
  const [collapsed, setCollapsed] = useState(true);
  const { colorMode: theme } = useColorMode();
  const { dataSource = [] } = props;

  const items = useMemo(() => {
    return dataSource.map((item) => {
      const { label, key, icon } = item;
      const Icon= getIconByName(icon);
      return {
        label,
        key,
        icon: <Icon />,
      };
    });
  }, [props.dataSource]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const onMenuChange = ({ key }) => {
    document.getElementById(`nav-card-title-${key}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.menuWrapper}>
      <Menu
        className={styles.menu}
        mode="vertical"
        items={items}
        theme={theme}
        inlineCollapsed={collapsed}
        onClick={onMenuChange}
      />
      <Button className={styles.button} type="primary" onClick={toggleCollapsed} style={{ left: collapsed ? 16 : 4 }}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button>
    </div>
  );
};

export default Category;
