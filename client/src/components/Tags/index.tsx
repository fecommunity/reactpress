import { Tag } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { getColorFromNumber } from '@/utils';
import style from './index.module.scss';

export const Tags = ({ tags = [], needTitle = true, style: cssStyle = {} }) => {
  const t = useTranslations();

  return (
    <div className={style.wrapper} style={cssStyle}>
      {needTitle && (
        <div className={style.title}>
          <span>{t('tagTitle')}</span>
        </div>
      )}
      <ul className={style.tagWrapper}>
        {tags.map((tag, index) => (
          <Tag key={tag.id} color={getColorFromNumber(index)} className={style.item}>
            <Link href={`/tag/[tag]`} as={`/tag/` + tag.value} scroll={false}>
              <a aria-label={tag.label} className={style.link}>
                {tag.label} [{tag.articleCount}]
              </a>
            </Link>
          </Tag>
        ))}
      </ul>
    </div>
  );
};
