import { NextPage } from 'next';

import { AdvanceSearch } from '@/components/AdvanceSearch';
import NavCard from '@/components/NavCard';
import style from './index.module.scss';
import { ArticleProvider } from '@/providers/article';
import { CategoryProvider } from '@/providers/category';
import settings from './config';

interface IHomeProps {
  articles?: IArticle[];
  total?: number;
}

const Page: NextPage<IHomeProps> = ({}) => {
  const { urlConfig, navConfig } = settings || {};
  return (
    <div className={style.wrapper}>
      <div className="container">
        <div className={style.search}>
          <AdvanceSearch globalSetting={navConfig} />
        </div>
        <div className={style.content}>
          <NavCard dataSource={urlConfig} />
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
