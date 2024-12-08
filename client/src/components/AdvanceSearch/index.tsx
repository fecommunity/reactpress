import { Input, AutoComplete, Flex, Button, Tabs, Spin } from 'antd';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ListTrail } from '@/components/Animation/Trail';
import { useAsyncLoading } from '@/hooks/useAsyncLoading';
import { SearchProvider } from '@/providers/search';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';

import styles from './index.module.scss';
import { jsonp } from '@/utils/jsonp';
import { debounce } from '@/utils';

const { Search: AntdSearch } = Input;

const searchCategories = [
  {
    label: '站内',
    key: 'local',
    subCategories: [
      {
        label: '工具111',
        key: 'tools',
      },
      {
        label: '工具2222',
        key: 'tools111',
      },
    ],
  },
  {
    label: '常用',
    key: 'common',
  },
  {
    label: '搜索',
    key: 'search',
  },
  {
    label: '工具',
    key: 'tools',
  },
  {
    label: '社区',
    key: 'community',
  },
  {
    label: '生活',
    key: 'life',
    subCategories: [
      {
        label: 'dadadada',
        key: 'tools',
      },
      {
        label: 'dadad',
        key: 'tools111',
      },
    ],
  },
  {
    label: '求职',
    key: 'job',
  },
];

interface IProps {
  visible: boolean;
  tags: ITag[];
  onClose: (arg: boolean) => void;
}

const Title: React.FC<Readonly<{ title?: string }>> = (props) => (
  <Flex align="center" justify="space-between">
    {props.title}
    <a href="https://www.google.com/search?q=antd" target="_blank" rel="noopener noreferrer">
      more
    </a>
  </Flex>
);

const renderItem = (title: string, count: number) => ({
  key: title,
  label: (
    <Flex align="center" justify="space-between">
      {title}
      <span>
        <UserOutlined /> {count}
      </span>
    </Flex>
  ),
});

const options = [
  {
    label: <Title title="Libraries" />,
    options: [renderItem('AntDesign', 10000), renderItem('AntDesign UI', 10600)],
  },
  {
    label: <Title title="Solutions" />,
    options: [renderItem('AntDesign UI FAQ', 60100), renderItem('AntDesign FAQ', 30010)],
  },
  {
    label: <Title title="Articles" />,
    options: [renderItem('AntDesign design language', 100000)],
  },
];

export const AdvanceSearch: React.FC<IProps> = ({ visible = true, onClose }) => {
  const ref = useRef(null);
  const t = useTranslations();
  const [category, setCategory] = useState(searchCategories?.[0]?.key);
  const [options, setOptions] = useState<any[]>([]);
  const subCategories = searchCategories
    .filter((item) => item.key === category)
    .map((item) => item.subCategories)
    .flat();
  const [searchArticles, loading] = useAsyncLoading(SearchProvider.searchArticles);
  const [articles, setArticles] = useState<IArticle[]>([]);
  const close = useCallback(() => {
    onClose(false);
  }, [onClose]);

  const getArticles = useCallback(
    (keyword) => {
      if (!keyword) {
        setArticles([]);
        return;
      }
      searchArticles(keyword).then((res) => {
        setArticles(res.filter((t) => t.status === 'publish'));
      });
    },
    [searchArticles]
  );

  useEffect(() => {
    if (!visible || !ref.current) {
      return;
    }
    setTimeout(() => {
      // 等待下一次事件循环触发
      ref.current.focus();
    }, 0);
  }, [visible]);

  const fetchSuggestions = debounce((keyword: string) => {
    if (!keyword?.length) {
      return setOptions([]);
    }
    switch (category) {
      case 'local':
        return searchArticles(keyword).then((res) => {
          const options = res
            .filter((t) => t.status === 'publish')
            .map((item) => ({
              label: item?.title,
              key: item?.title,
            }));
          setOptions(options);
        });
      default:
        return jsonp(
          `https://suggestion.baidu.com/su`,
          {
            wd: keyword,
          },
          (res) => {
            const options = (res?.s || []).map((item) => ({
              label: item,
              key: item,
            }));
            setOptions(options);
          }
        );
    }
  }, 100);

  return (
    <div className={styles.wrapper}>
      <div className={styles.bg}></div>
      <section className={styles.searchWrapper}>
        <Tabs
          defaultActiveKey={category}
          className={styles.searchCategory}
          size="small"
          items={searchCategories}
          onChange={setCategory}
        />
        <AutoComplete
          className={styles.autoComplete}
          options={options}
          size="large"
          key={category}
          // onSearch={handleSearch}
          onChange={fetchSuggestions}
          notFoundContent={loading ? <Spin size="small" /> : null}
          // placeholder="输入搜索内容"
          popupClassName={styles.pop}
          // allowClear
        >
          <Input
            size="large"
            placeholder="input here"
            className={styles.searchInput}
            suffix={<Button icon={<SearchOutlined style={{ fontSize: 24 }} />} type="text" />}
          />
        </AutoComplete>
        <Tabs
          // defaultActiveKey="1"
          className={styles.searchSubCategory}
          size="small"
          items={subCategories}
          // onChange={onChange}
        />
      </section>

      {/* <section className={styles.result}>
        {articles.length ? (
          <ul>
            <ListTrail
              length={articles.length}
              options={{
                config: { mass: 1, tension: 180, friction: 12, clamp: true },
                opacity: loading ? 0 : 1,
                height: loading ? 0 : 48,
                from: { opacity: 0, height: 0 },
              }}
              renderItem={(index) => {
                const article = articles[index];
                return (
                  <Link key={article.id} href={`/article/[id]`} as={`/article/${article.id}`} scroll={false}>
                    <a aria-label={article.title} className={styles.item} onClick={close}>
                      {article.title}
                    </a>
                  </Link>
                );
              }}
            />
          </ul>
        ) : (
          <p className="empty">{t('empty')}</p>
        )}
      </section> */}
    </div>
  );
};
