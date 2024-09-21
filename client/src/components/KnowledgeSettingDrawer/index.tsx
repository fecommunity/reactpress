import { Button, Drawer, Input, message, Switch } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

import { FileSelectDrawer } from '@/components/FileSelectDrawer';
import { Upload } from '@/components/Upload';
import { useAsyncLoading } from '@/hooks/useAsyncLoading';
import { useToggle } from '@/hooks/useToggle';
import { KnowledgeProvider } from '@/providers/knowledge';

export const KnowledgeSettingDrawer = ({ visible, toggleVisible, book = null, onOk }) => {
  const isUpdate = book !== null;
  const [fileVisible, toggleFileVisible] = useToggle(false);
  const [createBookApi, createLoading] = useAsyncLoading(KnowledgeProvider.createBook);
  const [updateBookApi, updateLoading] = useAsyncLoading(KnowledgeProvider.updateKnowledge);
  const [title, setTitle] = useState((book && book.title) || '');
  const [summary, setSummary] = useState((book && book.summary) || '');
  const [isCommentable, setCommentable] = useState((book && book.isCommentable) || true);
  const [cover, setCover] = useState((book && book.cover) || '');

  const ok = useCallback(() => {
    const data = { title: title.trim(), cover, summary: summary.trim(), isCommentable };
    const promise = isUpdate ? updateBookApi(book.id, data) : createBookApi(data);
    promise.then((res) => {
      message.success(isUpdate ? '更新成功' : '创建成功');
      toggleVisible();
      onOk(res);
    });
  }, [title, summary, isCommentable, cover, isUpdate, updateBookApi, createBookApi, book, toggleVisible, onOk]);

  useEffect(() => {
    setTitle((book && book.title) || '');
    setSummary((book && book.summary) || '');
    setCommentable((book && book.isCommentable) || false);
    setCover((book && book.cover) || '');
  }, [book]);

  return (
    <Drawer title={isUpdate ? '更新知识库' : '新建知识库'} width={600} visible={visible} onClose={toggleVisible}>
      <div className="form-item">
        <label htmlFor="title">名称</label>
        <div>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
      </div>
      <div className="form-item">
        <label htmlFor="summary">描述</label>
        <div>
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 6 }}
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>
      </div>
      <div className="form-item">
        <label htmlFor="title">评论</label>
        <div>
          <Switch checked={isCommentable} onChange={setCommentable} />
        </div>
      </div>
      <div className="form-item">
        <label htmlFor="upload">封面</label>
        <div>
          <Upload
            style={{
              width: '100%',
              minHeight: 160,
            }}
            onChange={setCover}
          >
            {cover ? <img src={cover} alt="avatar" style={{ width: '100%' }} /> : null}
          </Upload>
          <Input value={cover} onChange={(e) => setCover(e.target.value)} style={{ marginTop: 12 }}></Input>
          <Button style={{ marginTop: 12 }} onClick={toggleFileVisible}>
            选择文件
          </Button>
          {cover && (
            <Button style={{ marginTop: 12, marginLeft: 12 }} danger={true} onClick={() => setCover('')}>
              移除
            </Button>
          )}
        </div>
      </div>
      <FileSelectDrawer
        visible={fileVisible}
        onClose={toggleFileVisible}
        onChange={(url) => {
          setCover(url);
          toggleFileVisible();
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
        <Button onClick={toggleVisible}>取消</Button>
        <Button
          style={{ marginLeft: 8 }}
          type="primary"
          disabled={!title.trim()}
          loading={isUpdate ? updateLoading : createLoading}
          onClick={ok}
        >
          {isUpdate ? '更新' : '创建'}
        </Button>
      </div>
    </Drawer>
  );
};
