import { Button, Drawer, Input, Select, Switch } from 'antd';
import React, { useEffect, useReducer, useState } from 'react';

import { FileSelectDrawer } from '@/components/FileSelectDrawer';
import { CategoryProvider } from '@/providers/category';
import { TagProvider } from '@/providers/tag';

import style from './index.module.scss';

interface IProps {
  visible: boolean;
  article?: Partial<IArticle>;
  onClose: () => void;
  onChange?: (arg) => void;
}

const FormItem = ({ label, content }) => {
  return (
    <div className={style.formItem}>
      <span>{label}</span>
      <div>{content}</div>
    </div>
  );
};

const initialArticleAttrs = {
  summary: null, // 摘要
  password: null, // 密码
  isCommentable: true, // 评论
  isRecommended: true, // 推荐到首页
  category: null, // 分类
  tags: [], // 标签
  cover: null, // 封面
};
function reducer(state: typeof initialArticleAttrs = initialArticleAttrs, action) {
  const payload = action.payload;
  switch (action.type) {
    case 'summary':
      return { ...state, summary: payload };
    case 'password':
      return { ...state, password: payload };
    case 'isCommentable':
      return { ...state, isCommentable: payload };
    case 'isRecommended':
      return { ...state, isRecommended: payload };
    case 'category':
      return { ...state, category: payload };
    case 'tags':
      return { ...state, tags: payload };
    case 'cover':
      return { ...state, cover: payload };
    default:
      return state;
  }
}
export const ArticleSettingDrawer: React.FC<IProps> = ({ article, visible, onClose, onChange }) => {
  const [fileVisible, setFileVisible] = useState(false);
  const [attrs, dispatch] = useReducer(reducer, article as typeof initialArticleAttrs);
  const [categorys, setCategorys] = useState<Array<ICategory>>([]);
  const [tags, setTags] = useState<Array<ITag>>([]);

  useEffect(() => {
    CategoryProvider.getCategory().then((res) => setCategorys(res));
    TagProvider.getTags().then((tags) => setTags(tags));
  }, []);

  const ok = () => {
    onChange({
      ...attrs,
      tags: (attrs.tags || []).join(','),
    });
  };

  return (
    <Drawer width={480} placement="right" title={'文章设置'} closable={true} onClose={onClose} visible={visible}>
      <FormItem
        label="文章摘要"
        content={
          <Input.TextArea
            className={style.formItem}
            placeholder="请输入文章摘要"
            autoSize={{ minRows: 6, maxRows: 8 }}
            value={attrs.summary}
            onChange={(e) => {
              dispatch({ type: 'summary', payload: e.target.value });
            }}
          />
        }
      />
      <FormItem
        label="访问密码"
        content={
          <Input.Password
            placeholder="输入后查看需要密码"
            value={attrs.password}
            onChange={(e) => {
              dispatch({ type: 'password', payload: e.target.value });
            }}
          />
        }
      />
      <FormItem
        label="开启评论"
        content={
          <Switch
            checked={attrs.isCommentable}
            onChange={(val) => {
              dispatch({ type: 'isCommentable', payload: val });
            }}
          />
        }
      />
      <FormItem
        label="首页推荐"
        content={
          <Switch
            checked={attrs.isRecommended}
            onChange={(val) => {
              dispatch({ type: 'isRecommended', payload: val });
            }}
          />
        }
      />
      <FormItem
        label="选择分类"
        content={
          <Select
            value={(attrs.category && attrs.category.id) || attrs.category}
            onChange={(id) => {
              dispatch({ type: 'category', payload: id });
            }}
            style={{ width: '100%' }}
          >
            {categorys.map((t) => (
              <Select.Option key={t.id} value={t.id}>
                {t.label}
              </Select.Option>
            ))}
          </Select>
        }
      />
      <FormItem
        label="选择标签"
        content={
          <Select
            style={{ width: '100%' }}
            mode="tags"
            value={(attrs.tags || []).map((t) => t.id || t)}
            onChange={(tags) => {
              dispatch({ type: 'tags', payload: tags });
            }}
          >
            {tags.map((tag) => (
              <Select.Option key={tag.id} value={tag.id}>
                {tag.label}
              </Select.Option>
            ))}
          </Select>
        }
      />
      <FormItem
        label="文章封面"
        content={
          <div className={style.cover}>
            <div onClick={() => setFileVisible(true)} className={style.preview}>
              <img src={attrs.cover} alt="预览图" />
            </div>
            <Input
              placeholder="或输入外部链接"
              value={attrs.cover}
              onChange={(e) => {
                dispatch({ type: 'cover', payload: e.target.value });
              }}
            />
            <Button
              onClick={() => {
                dispatch({ type: 'cover', payload: null });
              }}
            >
              移除
            </Button>
          </div>
        }
      />
      <FileSelectDrawer
        closeAfterClick={true}
        visible={fileVisible}
        onClose={() => setFileVisible(false)}
        onChange={(url) => {
          dispatch({ type: 'cover', payload: url });
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e8e8e8',
          padding: '10px 16px',
          textAlign: 'right',
          left: 0,
          background: 'var(--bg)',
          borderRadius: '0 0 4px 4px',
        }}
      >
        <Button type="primary" onClick={ok}>
          确认
        </Button>
      </div>
    </Drawer>
  );
};
