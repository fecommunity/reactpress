import { Tag } from 'antd';
import cls from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import React from 'react';

import style from './index.module.scss';

export const Tags = ({ tags = [], needTitle = true, style: cssStyle = {} }) => {
  const router = useRouter();
  const t = useTranslations();
  const { tag: routerTag } = router.query;

  function getColorFromNumber(num) {
    const colors = ['#dc3545', '#17a2b8', '#00b74a', '#fc651f', '#6c757d', '#f5c800', '#808695'];
    const index = num % colors.length;
    return colors[index];
  }

  return (
    <div className={style.wrapper} style={cssStyle}>
      {needTitle && (
        <div className={style.title}>
          <span>{t('tagTitle')}</span>
        </div>
      )}
      <ul>
        {tags.map((tag, index) => (
          <Tag key={tag.id} color={getColorFromNumber(index)} className={style.item}>
            <Link href={`/tag/[tag]`} as={`/tag/` + tag.value} scroll={false}>
              <a aria-label={tag.label}>
                {tag.label} [{tag.articleCount}]
              </a>
            </Link>
          </Tag>
          // <li key={tag.id} className={cls(style.item, routerTag === tag.value ? style.active : false)}>
          //   <Link href={`/tag/[tag]`} as={`/tag/` + tag.value} scroll={false}>
          //     <a aria-label={tag.label}>
          //       {tag.label} [{tag.articleCount}]
          //     </a>
          //   </Link>
          // </li>
        ))}
      </ul>
    </div>
  );
};
