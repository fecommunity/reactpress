import { AutoComplete, Button, Input, Spin, Tabs } from 'antd';
import React, { useContext, useEffect, useState } from 'react';

import { useAsyncLoading } from '@/hooks/useAsyncLoading';
import { SearchProvider } from '@/providers/search';
import { SearchOutlined } from '@ant-design/icons';

import { GlobalContext } from '@/context/global';
import { ArticleProvider } from '@/providers/article';
import { jsonp } from '@/utils/jsonp';
import styles from './index.module.scss';

interface IProps {
  globalSetting?: any;
}

export const AdvanceSearch: React.FC<IProps> = (props) => {
  const { globalSetting } = useContext(GlobalContext);
  const { subCategories = {}, categories } = globalSetting?.globalConfig?.navConfig || props.globalSetting || {};
  const [category, setCategory] = useState(categories?.[0]?.key);
  const [subCategory, setSubCategory] = useState(subCategories?.[category]?.[0]?.key);
  const [options, setOptions] = useState<any[]>([]);
  const [searchVal, setSearchVal] = useState();

  useEffect(() => {
    setSubCategory(subCategories?.[category]?.[0]?.key);
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
            wd: keyword || '高热度网',
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
    const link = data?.url ? `${data.url}${searchVal || '高热度网'}` : null;
    if (category === 'local' || !!searchVal) {
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
