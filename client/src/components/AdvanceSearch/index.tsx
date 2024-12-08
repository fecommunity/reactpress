import { AutoComplete, Button, Input, Spin, Tabs } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAsyncLoading } from '@/hooks/useAsyncLoading';
import { SearchProvider } from '@/providers/search';
import { SearchOutlined } from '@ant-design/icons';

import { debounce } from '@/utils';
import { jsonp } from '@/utils/jsonp';
import styles from './index.module.scss';
import { ArticleProvider } from '@/providers/article';

interface CategoryItem {
  label: string;
  key: string;
  url?: string;
}

const categories: CategoryItem[] = [
  {
    label: '站内',
    key: 'local',
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
    label: '求职',
    key: 'job',
  },
];

const subCategories = {
  search: [
    {
      label: '百度',
      key: 'search-baidu',
      url: 'https://www.baidu.com/s?wd=',
    },
    {
      label: 'Bing',
      key: 'search-bing',
      url: 'https://cn.bing.com/search?q=',
    },
    {
      label: 'Google',
      key: 'search-google',
      url: 'https://www.google.com/search?q=',
    },
    {
      label: '搜狗',
      key: 'search-sougou',
      url: 'https://www.sogou.com/web?query=',
    },
  ],
  tools: [
    {
      label: '权重查询',
      key: 'tools-quanzhong',
      url: 'https://rank.chinaz.com/all/',
    },
    {
      label: 'SEO查询',
      key: 'tools-seo',
      url: 'https://seo.chinaz.com/',
    },
    {
      label: '关键词查询',
      key: 'tools-keyword',
      url: 'https://www.5118.com/seo/newrelated/',
    },
  ],
  community: [
    {
      label: 'Github',
      key: 'community-github',
      url: 'https://github.com/search?type=repositories&q=',
    },
    {
      label: '掘金',
      key: 'community-juejin',
      url: 'https://juejin.cn/search?type=0&query=',
    },
    {
      label: '知乎',
      key: 'community-zhihu',
      url: 'https://www.zhihu.com/search?type=content&q=',
    },
    {
      label: '豆瓣',
      key: 'community-douban',
      url: 'https://www.douban.com/search?q=',
    },
  ],
  job: [
    {
      label: 'BOSS直聘',
      key: 'job-boss',
      url: 'https://www.zhipin.com/web/geek/job?query=',
    },
    {
      label: '智联招聘',
      key: 'job-zhilian',
      url: 'https://sou.zhaopin.com/jobs/searchresult.ashx?kw=',
    },
    {
      label: '前程无优',
      key: 'job-51job',
      url: 'https://we.51job.com/pc/search?searchType=2&sortType=0&keyword=',
    },
    {
      label: '拉钩网',
      key: 'job-lagou',
      url: 'https://www.lagou.com/jobs/list_',
    },
    {
      label: '猎聘网',
      key: 'job-liepin',
      url: 'https://www.liepin.com/zhaopin/?key=',
    },
  ],
};

const defaultKeyWord = '高热度网';

interface IProps {
  visible: boolean;
  tags: ITag[];
  onClose: (arg: boolean) => void;
}

export const AdvanceSearch: React.FC<IProps> = (props) => {
  const [category, setCategory] = useState(categories?.[0]?.key);
  const [subCategory, setSubCategory] = useState(subCategories?.[0]?.key);
  const [options, setOptions] = useState<any[]>([]);
  const [searchVal, setSearchVal] = useState();

  useEffect(() => {
    setSubCategory(subCategories[category]?.[0]?.key);
    fetchSuggestions(searchVal);
  }, [category]);

  const fetchLocalData = (keyword: string) => {
    if (keyword?.length) {
      return SearchProvider.searchArticles(keyword);
    } else {
      return ArticleProvider.getRecommend();
    }
  };

  const [searchArticles, loading] = useAsyncLoading(fetchLocalData);

  const fetchSuggestions = (keyword: string) => {
    switch (category) {
      case 'local':
        return searchArticles(keyword).then((res) => {
          const options = res
            .filter((t) => t.status === 'publish')
            .map((item) => ({
              label: item?.title,
              value: item?.title,
              description: item?.summary,
              link: `/article/${item?.id}`,
              data: item,
            }));
          setOptions(options);
        });
      default:
        return jsonp(
          `https://suggestion.baidu.com/su`,
          {
            wd: keyword || defaultKeyWord,
          },
          (res) => {
            const data = subCategories[category]?.find((item) => item.key === subCategory);
            const options = (res?.s || []).map((item) => ({
              link: data?.url ? `${data.url}${item}` : null,
              label: item,
              value: item,
            }));
            setOptions(options);
          }
        );
    }
  };

  const onValueChange = (val) => {
    setSearchVal(val);
    fetchSuggestions(val);
  };

  const handleSearch = () => {
    const data = subCategories[category]?.find((item) => item.key === subCategory);
    const link = data?.url ? `${data.url}${searchVal}` : null;
    if (category === 'local') {
      fetchSuggestions(searchVal);
    } else {
      window.open(link, '_blank');
    }
  };

  const optionRender = (record, info) => {
    const { label, value, data: { link, description, id } = {} as any } = record;

    return (
      <div
        className={styles.searchItem}
        onClick={(e) => {
          !!link && window.open(link, '_blank');
          e.stopPropagation();
        }}
        key={info?.index}
      >
        <div className={styles.title}>{label}</div>
        <p className={styles.description} dangerouslySetInnerHTML={{ __html: description }} />
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.bg}></div>
      <section className={styles.searchWrapper}>
        <Tabs
          activeKey={category}
          className={styles.searchCategory}
          size="small"
          items={categories}
          onChange={(val) => {
            setCategory(val);
          }}
        />
        <AutoComplete
          className={styles.autoComplete}
          options={options}
          optionRender={optionRender}
          size="large"
          onChange={onValueChange}
          onFocus={() => fetchSuggestions(searchVal)}
          notFoundContent={loading ? <Spin size="small" /> : null}
          popupClassName={styles.pop}
        >
          <Input
            size="large"
            placeholder={'请输入关键字搜索'}
            className={styles.searchInput}
            suffix={<Button icon={<SearchOutlined onClick={handleSearch} style={{ fontSize: 24 }} />} type="text" />}
          />
        </AutoComplete>
        <Tabs
          style={{ display: subCategories[category]?.length ? 'initial' : 'none' }}
          activeKey={subCategory}
          className={styles.searchSubCategory}
          size="small"
          items={subCategories[category]}
          onChange={(value) => {
            setSubCategory(value);
            fetchSuggestions(searchVal);
          }}
        />
      </section>
    </div>
  );
};
