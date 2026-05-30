import { Popover } from 'antd';
import React from 'react';

import { useSetting } from '@/hooks/useSetting';
import { resolveUrl } from '@/utils';

import style from './index.module.scss';

export const CommentArticle = ({ comment }) => {
  const setting = useSetting();
  const { url: link } = comment;
  const href = resolveUrl(setting?.systemUrl, link);

  return (
    <Popover title={'页面预览'} content={<iframe src={href} />} placement={'right'} mouseEnterDelay={0.5}>
      <a href={href} className={style.link} target="_blank" rel="noreferrer">
        文章
      </a>
    </Popover>
  );
};
