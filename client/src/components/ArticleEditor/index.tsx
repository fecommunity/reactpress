import { CloseOutlined, EllipsisOutlined } from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import { Editor as MDEditor } from '@components/Editor';
import { Button, Dropdown, Input, Layout, Menu, message, Modal } from 'antd';
import cls from 'classnames';
import { default as Router } from 'next/router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';

import { useSetting } from '@/hooks/useSetting';
import { useToggle } from '@/hooks/useToggle';
import { useWarningOnExit } from '@/hooks/useWarningOnExit';
import { ArticleProvider } from '@/providers/article';
import { resolveUrl } from '@/utils';

import { ArticleSettingDrawer } from './ArticleSettingDrawer';
import style from './index.module.scss';

interface IProps {
  id?: string | number;
  article?: IArticle;
}

const REQUIRED_ARTICLE_ATTRS = [
  ['title', '请输入文章标题'],
  ['content', '请输入文章内容'],
];

// 副作用：传给服务端的 category 需要是 id
const transformCategory = (article) => {
  if (article.category && article.category.id) {
    article.category = article.category.id;
  }
};
const transformTags = (article) => {
  if (Array.isArray(article.tags)) {
    try {
      article.tags = (article.tags as ITag[]).map((t) => t.id).join(',');
    } catch (e) {
      console.log(e);
    }
  }
};

export const ArticleEditor: React.FC<IProps> = ({ id: defaultId, article: defaultArticle = { title: '' } }) => {
  const isCreate = !defaultId; // 一开始是否是新建
  const setting = useSetting();
  const [id, setId] = useState(defaultId);
  const [article, setArticle] = useState<Partial<IArticle>>(defaultArticle);
  const [settingDrawerVisible, toggleSettingDrawerVisible] = useToggle(false);
  const [hasSaved, toggleHasSaved] = useToggle(false);

  const patchArticle = useMemo(
    () => (key) => (value) => {
      if (value.target) {
        value = value.target.value;
      }
      setArticle((article) => {
        article[key] = value;
        return article;
      });
    },
    []
  );

  // 校验文章必要属性
  const check = useCallback(() => {
    let canPublish = true;
    let errorMsg = null;
    REQUIRED_ARTICLE_ATTRS.forEach(([key, msg]) => {
      if (!article[key]) {
        errorMsg = msg;
        canPublish = false;
      }
    });
    if (!canPublish) {
      return Promise.reject(new Error(errorMsg));
    }
    return Promise.resolve();
  }, [article]);

  // 打开发布抽屉
  const openSetting = useCallback(() => {
    check()
      .then(() => {
        toggleSettingDrawerVisible();
      })
      .catch((err) => {
        message.warning(err.message);
      });
  }, [check, toggleSettingDrawerVisible]);

  const saveSetting = useCallback(
    (setting) => {
      toggleSettingDrawerVisible();
      Object.assign(article, setting);
    },
    [article, toggleSettingDrawerVisible]
  );

  // 保存草稿或者发布线上
  const saveOrPublish = useCallback(
    (patch = {}) => {
      const data = { ...article, ...patch };
      return check()
        .then(() => {
          transformCategory(data);
          transformTags(data);
          const promise = !isCreate ? ArticleProvider.updateArticle(id, data) : ArticleProvider.addArticle(data);
          return promise.then((res) => {
            setId(res.id);
            toggleHasSaved(true);
            message.success(res.status === 'draft' ? '文章已保存为草稿' : '文章已发布');
          });
        })
        .catch((err) => {
          message.warning(err.message);
          return Promise.reject(err);
        });
    },
    [article, isCreate, check, id, toggleHasSaved]
  );

  const saveDraft = useCallback(() => {
    return saveOrPublish({ status: 'draft' });
  }, [saveOrPublish]);

  const publish = useCallback(() => {
    return saveOrPublish({ status: 'publish' });
  }, [saveOrPublish]);

  // 预览文章
  const preview = useCallback(() => {
    if (id) {
      if (!setting.systemUrl) {
        message.error('尚未配置前台地址，无法正确构建预览地址');
        return;
      }
      window.open(resolveUrl(setting.systemUrl, '/article/' + id));
    } else {
      message.warning('请先保存');
    }
  }, [id, setting.systemUrl]);

  const deleteArticle = useCallback(() => {
    if (!id) {
      return;
    }
    const handle = () => {
      ArticleProvider.deleteArticle(id).then(() => {
        toggleHasSaved(true);
        message.success('文章删除成功');
        Router.push('/article');
      });
    };
    Modal.confirm({
      title: '确认删除？',
      content: '删除内容后，无法恢复。',
      onOk: handle,
      okText: '确认',
      cancelText: '取消',
      transitionName: '',
      maskTransitionName: '',
    });
  }, [id, toggleHasSaved]);

  const goback = useCallback(() => {
    Router.push('/admin/article');
  }, []);

  useEffect(() => {
    if (isCreate && id) {
      Router.replace('/admin/article/editor/' + id);
    }
  }, [id, isCreate]);

  useWarningOnExit(!hasSaved, () => window.confirm('确认关闭？如果有内容变更，请先保存!'));

  return (
    <div className={style.wrapper}>
      <Head>
        <title>{id ? `编辑文章 ${article.title ? '-' + article.title : ''}` : '新建文章'}</title>
      </Head>
      <header className={style.header}>
        <PageHeader
          backIcon={<Button size="small" icon={<CloseOutlined />} />}
          style={{
            borderBottom: '1px solid rgb(235, 237, 240)',
          }}
          onBack={goback}
          title={
            <Input
              style={{ width: 300 }}
              placeholder="请输入文章标题"
              defaultValue={article.title}
              onChange={patchArticle('title')}
            />
          }
          extra={[
            <Button key="publish" type="primary" onClick={publish}>
              发布
            </Button>,
            <Dropdown
              key="more"
              overlay={
                <Menu>
                  <Menu.Item key="view" disabled={isCreate} onClick={preview}>
                    查看
                  </Menu.Item>
                  <Menu.Item key="setting" onClick={openSetting}>
                    设置
                  </Menu.Item>
                  <Menu.Divider key="divide-1" />
                  <Menu.Item key="draft" onClick={saveDraft}>
                    保存草稿
                  </Menu.Item>
                  <Menu.Divider key="divide-2" />
                  <Menu.Item key="delete" disabled={isCreate} onClick={deleteArticle}>
                    删除
                  </Menu.Item>
                </Menu>
              }
            >
              <Button icon={<EllipsisOutlined />} type="link"></Button>
            </Dropdown>,
          ]}
        />
      </header>
      <main className={cls(style.main)}>
        <MDEditor
          defaultValue={article.content}
          onChange={({ value, html, toc }) => {
            patchArticle('content')(value);
            patchArticle('html')(html);
            patchArticle('toc')(toc);
          }}
        />
      </main>
      <ArticleSettingDrawer
        article={article as IArticle}
        visible={settingDrawerVisible}
        onClose={toggleSettingDrawerVisible}
        onChange={saveSetting}
      />
    </div>
  );
};
