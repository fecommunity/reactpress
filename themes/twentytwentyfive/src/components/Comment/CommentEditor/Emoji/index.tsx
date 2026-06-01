import { Popover } from '@/ui';
import React from 'react';

import { emojis } from './emojis';
import styles from './index.module.scss';

export const Emoji: React.FC<{ onClickEmoji: (arg: string) => void; children?: React.ReactNode }> = ({
  onClickEmoji,
  children,
}) => {
  return (
    <Popover
      content={
        <ul className={styles.wrapper}>
          {Object.keys(emojis).map((key) => {
            return (
              <li key={key} onClick={() => onClickEmoji(emojis[key])}>
                {emojis[key]}
              </li>
            );
          })}
        </ul>
      }
      placement="bottomRight"
      trigger="click"
    >
      {children}
    </Popover>
  );
};
