import { NextPage } from 'next';

import { AdvanceSearch } from '@/components/AdvanceSearch';
import NavCard from '@/components/NavCard';
import SystemNotification from '@/components/Setting/SystemNotification';
import { ArticleProvider } from '@/providers/article';
import { CategoryProvider } from '@/providers/category';
import style from './index.module.scss';
import Head from 'next/head';
import { useContext } from 'react';
import { GlobalContext } from '@/context/global';
import { useTranslations } from 'next-intl';

interface IHomeProps {
  articles?: IArticle[];
  total?: number;
}

const Page: NextPage<IHomeProps> = ({}) => {
  const { setting } = useContext(GlobalContext);
  const t = useTranslations();
  return (
    <div className={style.wrapper}>
      <Head>
        <title>{`${t('nav')} - ${t('categoryArticle')} - ${setting.systemTitle}`}</title>
      </Head>
      <div className="container">
        <SystemNotification />
        <div className={style.search}>
          <AdvanceSearch />
        </div>
        <div className={style.content}>
          <NavCard />
        </div>
      </div>
    </div>
  );
};

// 服务端预取数据
Page.getInitialProps = async (ctx) => {
  const { category: categoryValue = 'nav' } = ctx.query;
  const [articles, category] = await Promise.all([
    ArticleProvider.getArticlesByCategory(categoryValue, {
      page: 1,
      pageSize: 1000,
      status: 'publish',
    }),
    CategoryProvider.getCategoryById(categoryValue),
  ]);
  return {
    articles: articles[0],
    total: articles[1],
    category: category,
    needLayoutFooter: true,
  };
};

export default Page;
