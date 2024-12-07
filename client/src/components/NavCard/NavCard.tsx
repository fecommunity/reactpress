import React, { useState } from 'react';
import { Card } from 'antd';
import styles from './index.module.scss';
import { CategoryItem } from '../NavCard';

interface NavCardProps {
  dataSource: CategoryItem[];
}

const NavCard: React.FC<NavCardProps> = (props) => {
  const { dataSource = [] } = props;
  const [tabKey, setTabKey] = useState({});

  const onTabChange = (key) => {
    
  }

  return (
    <div className={styles.cardWrapper}>
      {dataSource.map((item) => {
        return (
          <Card
            className={styles.card}
            title={item.label}
            extra={<a href="#">More</a>}
            // tabList={item.children}
            onTabChange={onTabChange}
          >
            {/* {contentList[activeTabKey1]} */}
            dadadadadadadad
          </Card>
        );
      })}
    </div>
  );
};

export default NavCard;
