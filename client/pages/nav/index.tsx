import { Categories } from '@components/Categories';
import { KnowledgeList } from '@components/KnowledgeList';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import { useCallback, useContext, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Helmet } from 'react-helmet';

import { ArticleRecommend } from '@/components/ArticleRecommend';
import { GlobalContext } from '@/context/global';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { KnowledgeProvider } from '@/providers/knowledge';
import style from './index.module.scss';
import { Input } from 'antd';
import { Search } from '@/components/Search';
import NavCard from '@/components/NavCard';
import { AdvanceSearch } from '@/components/AdvanceSearch';
import { GifOutlined, GithubOutlined } from '@ant-design/icons'

interface IHomeProps {
  books: IKnowledge[];
  total: number;
}

const pageSize = 12;

const Page: NextPage<IHomeProps> = ({ books: defaultBooks = [], total = 0 }) => {
  const { categories, setting } = useContext(GlobalContext);
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<IKnowledge[]>(defaultBooks);

  useEffect(() => {
    setBooks(defaultBooks);
  }, [defaultBooks]);

  const getArticles = useCallback((page) => {
    KnowledgeProvider.getKnowledges({
      page,
      pageSize,
      status: 'publish',
    }).then((res) => {
      setPage(page);
      setBooks((articles) => [...articles, ...res[0]]);
    });
  }, []);

  return (
    <div className={style.wrapper}>
      <div className="container">
        <div className={style.search}>
          <AdvanceSearch />
        </div>
        <div className={style.content}>
          <NavCard
            dataSource={[
              {
                key: 'sub1',
                label: 'Navigation One',
                icon: <GithubOutlined />,
                children: [
                  {
                    key: '1-1',
                    label: 'Item 1',
                    type: 'group',
                    children: [
                      { key: '1', label: 'Option 1' },
                      { key: '2', label: 'Option 2' },
                    ],
                  },
                  {
                    key: '1-2',
                    label: 'Item 2',
                    type: 'group',
                    children: [
                      { key: '3', label: 'Option 3' },
                      { key: '4', label: 'Option 4' },
                    ],
                  },
                ],
              },
              {
                key: 'sub2',
                label: 'Navigation Two',
                children: [
                  { key: '5', label: 'Option 5' },
                  { key: '6', label: 'Option 6' },
                  {
                    key: 'sub3',
                    label: 'Submenu',
                    children: [
                      { key: '7', label: 'Option 7' },
                      { key: '8', label: 'Option 8' },
                    ],
                  },
                ],
              },
              {
                key: 'sub4',
                label: 'Navigation Three',
                children: [
                  { key: '9', label: 'Option 9' },
                  { key: '10', label: 'Option 10' },
                  { key: '11', label: 'Option 11' },
                  { key: '12', label: 'Option 12' },
                ],
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

// 服务端预取数据
Page.getInitialProps = async () => {
  const [books, total] = await KnowledgeProvider.getKnowledges({
    page: 1,
    pageSize,
    status: 'publish',
  });
  return {
    books,
    total,
    needLayoutFooter: true,
  };
};

export default Page;
