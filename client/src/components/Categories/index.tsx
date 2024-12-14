import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { FolderOutlined } from '@ant-design/icons';

import style from './index.module.scss';

export const Categories = ({ categories = [] }) => {
  const t = useTranslations();

  return (
    <div className={style.wrapper}>
      <div className={style.title}>
        <FolderOutlined className={style.categoryIcon}/>
        <span>{t('categoryTitle')}</span>
      </div>
      <ul>
        {categories.map((category) => {
          return (
            <li key={category.value}>
              <Link href="/category/[category]" as={`/category/` + category.value} shallow={false}>
                <a aria-label={category.label}>
                  <span>{category.label}</span>
                  <span>
                    {t('total')} {category.articleCount} {t('articleCountTemplate')}
                  </span>
                </a>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
