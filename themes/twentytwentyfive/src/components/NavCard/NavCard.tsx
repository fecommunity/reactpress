import { Avatar, Card, List } from '@/ui';
import React from 'react';

import { getIconByName } from '@/utils';

import { CategoryItem } from '.';
import styles from './index.module.scss';

interface NavCardProps {
  dataSource: CategoryItem[];
}

const NavCard: React.FC<NavCardProps> = (props) => {
  const { dataSource = [] } = props;

  const getIconUrl = (item: { icon?: string; url?: string }) => {
    if (item?.icon) return item.icon;
    return `${item.url}/favicon.ico`;
  };

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
                <span className={styles.icon}>
                  <Icon />
                </span>
                <span className={styles.title}> {item.label}</span>
              </span>
            }
          >
            <ul className={styles.navListGrid}>
              {(item.children ?? []).map((child, index) => (
                <List.Item key={child.key ?? index}>
                  <List.Item.Meta
                    avatar={<Avatar src={getIconUrl(child)} />}
                    title={
                      <a href={`/nav/${child.key}.html`} rel="nofollow">
                        {child.label}
                      </a>
                    }
                    description={
                      <p title={child.description} className={styles.description}>
                        {child.description}
                      </p>
                    }
                    className={styles.listItem}
                  />
                </List.Item>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
};

export default NavCard;
