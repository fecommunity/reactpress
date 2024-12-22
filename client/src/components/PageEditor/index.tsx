import { CloseOutlined, EllipsisOutlined, FileImageOutlined } from '@ant-design/icons';
import { Editor as CodeEditor } from '@components/Editor';
import { Button, Drawer, Dropdown, Input, InputNumber, Menu, message, Modal } from 'antd';
import { PageHeader } from '@ant-design/pro-layout'
import cls from 'classnames';
import { default as Router } from 'next/router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';

import { FileSelectDrawer } from '@/components/FileSelectDrawer';
import { useSetting } from '@/hooks/useSetting';
import { useToggle } from '@/hooks/useToggle';
import { useWarningOnExit } from '@/hooks/useWarningOnExit';
import { PageProvider } from '@/providers/page';
import { resolveUrl } from '@/utils';

import style from './index.module.scss';

interface IProps {
  id?: string | number;
  page?: IPage;
}

const FormItem = ({ label, content }) => {
  return (
    <div className={style.formItem}>
      <span>{label}</span>
      <div>{content}</div>
    </div>
  );
};

const drawerFooterStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  width: '100%',
  borderTop: '1px solid #e8e8e8',
  padding: '10px 16px',
  textAlign: 'right',
  left: 0,
  background: '#fff',
  borderRadius: '0 0 4px 4px',
};

export const PageEditor: React.FC<IProps> = ({ id: defaultId, page: defaultPage = {} }) => {
  const setting = useSetting();
  const isCreate = !defaultId; // 一开始是否是新建
  const [id, setId] = useState(defaultId);
  const [page, setPage] = useState<Partial<IPage>>(defaultPage);
  const [pageDrawerVisible, togglePageDrawerVisible] = useToggle(false);
  const [fileDrawerVisible, toggleFileDrawerVisible] = useToggle(false);
  const [hasSaved, toggleHasSaved] = useToggle(false);

  const patchPage = useMemo(
    () => (key) => (value) => {
      if (value.target) {
        value = value.target.value;
      }
      setPage((page) => {
        if (key === 'path') {
          value = value.replace('/', '');
        }
        page[key] = value;
        return page;
      });
    },
    []
  );

  const save = useCallback(() => {
    if (!page.name) {
      message.warning('请输入页面名称');
      return;
    }
    page.status = 'draft';
    const promise = id ? PageProvider.updatePage(id, page) : PageProvider.addPage(page);
    return promise.then((res) => {
      toggleHasSaved(true);
      setId(res.id);
      message.success('页面已保存为草稿');
    });
  }, [page, id, toggleHasSaved]);

  const publish = useCallback(() => {
    let canPublish = true;
    void [
      ['name', '请输入页面名称'],
      ['path', '请输入页面路径'],
      ['content', '请输入页面内容'],
    ].forEach(([key, msg]) => {
      if (!page[key]) {
        message.warning(msg);
        canPublish = false;
      }
    });
    if (!canPublish) {
      page.name && togglePageDrawerVisible();
      return;
    }
    page.status = 'publish';
    if (id) {
      PageProvider.updatePage(id, page).then((res) => {
        toggleHasSaved(true);
        setId(res.id);
        message.success('页面已更新');
      });
    } else {
      PageProvider.addPage(page).then((res) => {
        toggleHasSaved(true);
        setId(res.id);
        message.success('页面已发布');
      });
    }
  }, [page, id, togglePageDrawerVisible, toggleHasSaved]);

  const preview = useCallback(() => {
    if (id) {
      window.open(resolveUrl(setting.systemUrl, '/page/' + id));
    } else {
      message.warning('请先保存');
    }
  }, [id, setting.systemUrl]);

  const deletePage = useCallback(() => {
    if (!id) {
      return;
    }
    const handle = () => {
      PageProvider.deletePage(id).then(() => {
        toggleHasSaved(true);
        message.success('页面删除成功');
        Router.push('/admin/page');
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
    Router.push('/admin/page');
  }, []);

  useEffect(() => {
    if (isCreate && id) {
      Router.replace('/admin/page/editor/' + id);
    }
  }, [isCreate, id]);

  useWarningOnExit(!hasSaved, () => window.confirm('确认关闭？如果有内容变更，请先保存!'));

  return (
    <div className={style.wrapper}>
      <Head>
        <title>{id ? `编辑页面 ${page.name ? '-' + page.name : ''}` : '新建页面'}</title>
      </Head>
      <header className={style.header}>
        <PageHeader
          style={{
            borderBottom: '1px solid rgb(235, 237, 240)',
            background: '#fff',
          }}
          backIcon={<Button size="small" icon={<CloseOutlined />} />}
          onBack={goback}
          title={
            <Input
              style={{ width: 300 }}
              placeholder="请输入页面名称"
              defaultValue={page.name}
              onChange={patchPage('name')}
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
                  <Menu.Item disabled={isCreate} key="preview" onClick={preview}>
                    查看
                  </Menu.Item>
                  <Menu.Item key="setting" onClick={togglePageDrawerVisible}>
                    设置
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="draft" onClick={save}>
                    保存草稿
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item disabled={isCreate} key="delete" onClick={deletePage}>
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
        <CodeEditor
          defaultValue={page.content}
          onChange={({ value, html, toc }) => {
            patchPage('content')(value);
            patchPage('html')(html);
            patchPage('toc')(toc);
          }}
        />
      </main>
      <Drawer title={'页面属性'} width={480} visible={pageDrawerVisible} onClose={togglePageDrawerVisible}>
        <FormItem
          label="封面"
          content={
            <Input
              placeholder="请输入页面封面"
              addonAfter={<FileImageOutlined onClick={toggleFileDrawerVisible} />}
              defaultValue={page.cover}
              onChange={patchPage('cover')}
            />
          }
        />
        <FormItem
          label="路径"
          content={<Input placeholder="请配置页面路径" defaultValue={page.path} onChange={patchPage('path')} />}
        />
        <FormItem label="顺序" content={<InputNumber defaultValue={page.order || 0} onChange={patchPage('order')} />} />
        <div style={drawerFooterStyle}>
          <Button type="primary" onClick={togglePageDrawerVisible}>
            确认
          </Button>
        </div>
      </Drawer>
      <FileSelectDrawer
        isCopy={true}
        closeAfterClick={true}
        visible={fileDrawerVisible}
        onClose={toggleFileDrawerVisible}
      />
    </div>
  );
};
