import React, { useMemo, useState } from 'react';
import type { MenuProps } from 'antd';
import { Button, Menu } from 'antd';
import { CategoryItem } from '../NavCard';
import styles from './index.module.scss';
import {
  AppstoreOutlined,
  ContainerOutlined,
  DesktopOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
} from '@ant-design/icons';

interface CategoryProps {
  dataSource: CategoryItem[];
}

const Category: React.FC<CategoryProps> = (props) => {
  const [collapsed, setCollapsed] = useState(false);

  const items = useMemo(() => {
    return props.dataSource.map((item) => {
      const { label, key, icon } = item;
      return {
        label,
        key,
        icon,
      };
    });
  }, [props.dataSource]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={styles.menuWrapper}>
      <Menu
        className={styles.menu}
        mode="vertical"
        items={items}
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        theme="dark"
        inlineCollapsed={collapsed}
      />
      <Button className={styles.button} type="primary" onClick={toggleCollapsed} style={{ marginBottom: 16 }}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button>
    </div>
  );
};

export default Category;
