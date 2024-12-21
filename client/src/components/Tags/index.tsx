import { TagOutlined } from '@ant-design/icons';
import { Tag, Flex } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import TagCloud from '@/components/TagCloud';
import { getColorFromNumber } from '@/utils';
import React, { FC } from 'react';
import style from './index.module.scss';

interface ITagsProps {
  /**
   * 标签数据
   */
  tags: ITag[];
  /**
   * 是否需要标题
   */
  needTitle?: boolean;
  /**
   * 行内样式
   */
  style?: React.CSSProperties;
  /**
   * 是否开启动画模式
   */
  animationMode?: boolean;
}

export const Tags: FC<ITagsProps> = ({ tags = [], needTitle = true, style: cssStyle = {}, animationMode = false }) => {
  const t = useTranslations();

  const getTagStyle = (index: number): React.CSSProperties => {
    return {
      backgroundColor: getColorFromNumber(index),
    };
  };

  return (
    <div className={style.wrapper} style={cssStyle}>
      {needTitle && (
        <div className={style.title}>
          <TagOutlined className={style.tagIcon} />
          <span>{t('tagTitle')}</span>
        </div>
      )}

      {animationMode ? (
        <TagCloud className={style.tagWrapper}>
          {tags.map((tag, index) => (
            <a key={tag.id} href={`/tag/` + tag.value} target="_self" style={getTagStyle(index)}>
              {tag.label}
            </a>
          ))}
        </TagCloud>
      ) : (
        <ul className={style.tagWrapper}>
          <Flex wrap gap="small">
            {tags.map((tag, index) => (
              <Tag key={tag.id} color={getColorFromNumber(index)} className={style.item}>
                <Link href={`/tag/[tag]`} as={`/tag/` + tag.value} scroll={false}>
                  <a aria-label={tag.label} className={style.link}>
                    {tag.label} [{tag.articleCount}]
                  </a>
                </Link>
              </Tag>
            ))}
          </Flex>
        </ul>
      )}
    </div>
  );
};
