import { Badge } from 'antd';
import cls from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';

import style from './index.module.scss';

export interface LikesProps {
  defaultCount?: number;
  id: string;
  api: (id, type) => Promise<number>;
}

export const Likes: React.FC<LikesProps> = ({ defaultCount, id, api }) => {
  const [count, setCount] = useState(defaultCount);
  const [likes, setLikes] = useState([]);

  const like = useCallback(() => {
    const idx = likes.indexOf(id);
    const type = idx > -1 ? 'dislike' : 'like';
    const newLikes = idx > -1 ? [...likes.slice(0, idx), ...likes.slice(idx + 1)] : [...likes, id];
    api(id, type).then((c) => {
      setCount(c);
      window.localStorage.setItem('LIKES', JSON.stringify(newLikes));
      setLikes(newLikes);
    });
  }, [likes, id, api]);

  useEffect(() => {
    setCount(defaultCount);
  }, [defaultCount]);

  useEffect(() => {
    const likeds = JSON.parse(window.localStorage.getItem('LIKES')) || [];
    setLikes(likeds);
  }, []);

  return (
    <Badge size="small" count={count} style={{ backgroundColor: 'var(--primary-color)' }}>
      <div className={cls(style.wrap, likes.includes(id) && style.active)} onClick={like}>
        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em">
          <path
            d="M859.8 191.2c-80.8-84.2-212-84.2-292.8 0L512 248.2l-55-57.2c-81-84.2-212-84.2-292.8 0-91 94.6-91 248.2 0 342.8L512 896l347.8-362C950.8 439.4 950.8 285.8 859.8 191.2z"
            fill="currentColor"
          ></path>
        </svg>
      </div>
    </Badge>
  );
};
