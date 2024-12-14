import { GlobalContext } from '@/context/global';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { Button, Menu } from 'antd';
import React, { useContext, useMemo, useState } from 'react';
import { CategoryItem } from '../NavCard';
import styles from './index.module.scss';
import { getIconByName } from '@/utils';

interface CategoryProps {
  dataSource: CategoryItem[];
}

const Category: React.FC<CategoryProps> = (props) => {
  const [collapsed, setCollapsed] = useState(true);
  const { theme } = useContext(GlobalContext);
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
