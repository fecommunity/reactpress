import React, { useCallback, useMemo } from 'react';
import { Menu } from 'antd';
import { CategoryItem } from '../NavCard';
import styles from './index.module.scss';

interface CategoryProps {
  dataSource: CategoryItem[];
}

const Category: React.FC<CategoryProps> = (props) => {
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

  return (
    <div className={styles.menuWrapper}>
      <Menu mode="vertical" items={items} />
    </div>
  );
};

export default Category;
