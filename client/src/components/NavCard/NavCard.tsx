import { Avatar, Card, List } from 'antd';
import React from 'react';
import { CategoryItem } from '../NavCard';
import styles from './index.module.scss';
import { getIconByName } from '@/utils';

interface NavCardProps {
  dataSource: CategoryItem[];
}

const NavCard: React.FC<NavCardProps> = (props) => {
  const { dataSource = [] } = props;

  const getIconUrl = (item) => {
    if (item?.icon) {
      return item.icon;
    }
    return `${item.url}/favicon.ico`;
  }

  return (
    <div className={styles.cardWrapper}>
      {dataSource.map((item) => {
        const Icon = getIconByName(item.icon);
        return (
          <Card
            key={item.key}
            className={styles.card}
            title={
              <span id={`nav-card-title-${item.key}`}>
                <span className={styles.icon}><Icon /></span>
                <span className={styles.title}> {item.label}</span>
              </span>
            }
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
                    avatar={<Avatar src={getIconUrl(item)} />}
                    title={<a href={`/nav/${item.key}.html`} rel='nofollow'>{item.label}</a>}
                    description={<p title={item.description} className={styles.description}>{item.description}</p>}
                    className={styles.listItem}
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
