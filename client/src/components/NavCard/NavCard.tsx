import React, { useState } from 'react';
import { Card, List, Avatar } from 'antd';
import styles from './index.module.scss';
import { CategoryItem } from '../NavCard';

interface NavCardProps {
  dataSource: CategoryItem[];
}

const NavCard: React.FC<NavCardProps> = (props) => {
  const { dataSource = [] } = props;
  const [tabKey, setTabKey] = useState({});

  const onTabChange = (key) => {};

  return (
    <div className={styles.cardWrapper}>
      {dataSource.map((item) => {
        return (
          <Card
            className={styles.card}
            title={
              <span>
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.title}> {item.label}</span>
              </span>
            }
            extra={<a href="#">More</a>}
            onTabChange={onTabChange}
          >
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 4,
                lg: 4,
                xl: 6,
                xxl: 3,
              }}
              dataSource={item.children}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                    title={<a href="https://ant.design">{item.label}</a>}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        );
      })}
    </div>
  );
};

export default NavCard;
