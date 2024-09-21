import { CloseOutlined, DeleteOutlined, MenuOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, Input, message, Modal, Popconfirm, Popover } from 'antd';
import arrayMove from 'array-move';
import cls from 'classnames';
import { NextPage } from 'next';
import { default as Router } from 'next/router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

import { Editor } from '@/components/Editor';
import { KnowledgeSettingDrawer } from '@/components/KnowledgeSettingDrawer';
import { useForceUpdate } from '@/hooks/useForceUpdate';
import { useToggle } from '@/hooks/useToggle';
import { KnowledgeProvider } from '@/providers/knowledge';
import { scrollToBottom } from '@/utils';

import styles from './index.module.scss';

const DragHandle = SortableHandle(() => (
  <span style={{ cursor: 'move' }}>
    <MenuOutlined />
  </span>
));

interface IProps {
  id: string | number;
  knowledge: Partial<IKnowledge>;
}

const Page: NextPage<IProps> = ({ id, knowledge: defaultKnowledge }) => {
  const forceUpdate = useForceUpdate();
  const $container = useRef<HTMLElement>();
  const hasSavedRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [popVisible, togglePopVisible] = useToggle(false);
  const [settingVisible, toggleSettingVisible] = useToggle(false);
  const [knowledge, setKnowledge] = useState(defaultKnowledge);
  const [newTitle, setNewTitle] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [chapters, setChapters] = useState<Array<Partial<IKnowledge>>>(knowledge.children || []);
  const currentChapter = useMemo(() => chapters[currentIndex] || null, [chapters, currentIndex]);

  const deleteKnowledge = useCallback(
    (idx) => {
      const handle = () => {
        setChapters((chapters) => {
          chapters.splice(idx, 1);
          return chapters;
        });
        forceUpdate();
        setCurrentIndex(currentIndex - 1);
      };
      const target = chapters[idx];
      if (target.id) {
        KnowledgeProvider.deleteKnowledge(target.id).then(() => {
          handle();
          message.success('已保存');
        });
      } else {
        handle();
      }
    },
    [chapters, currentIndex, forceUpdate]
  );

  const SortableItem = SortableElement(({ value: idx }) => (
    <div
      key={idx}
      className={cls({ 'active': idx === currentIndex, 'knowledge-chapter-item': true })}
      onClick={() => setCurrentIndex(idx)}
    >
      <DragHandle />
      <span>{chapters[idx].title}</span>
      <Popconfirm title="确认删除?" onConfirm={() => deleteKnowledge(idx)} okText="确定" cancelText="取消">
        <DeleteOutlined onClick={(e) => e.stopPropagation()} />
      </Popconfirm>
    </div>
  ));

  const SortableList = SortableContainer(({ items }) => {
    return (
      <div className={styles.menu}>
        {items.map((item, index) => (
          <SortableItem key={`item-${item.title}`} index={index} value={index} />
        ))}
      </div>
    );
  });

  const onSortEnd = useCallback(
    ({ oldIndex, newIndex }) => {
      if (currentIndex > -1) {
        setCurrentIndex(newIndex);
      }

      setChapters((chapters) => {
        return arrayMove(chapters, oldIndex, newIndex);
      });
    },
    [currentIndex]
  );

  const createNewKnowledge = useCallback(() => {
    const title = newTitle.trim();
    if (!title) {
      return;
    }
    setChapters((chapters) => {
      chapters.push({
        title: title,
        content: '',
      });
      return chapters;
    });
    setCurrentIndex(chapters.length - 1);
    setNewTitle('');
    togglePopVisible();
    forceUpdate();
    Promise.resolve().then(() => scrollToBottom($container.current));
  }, [newTitle, chapters, forceUpdate, togglePopVisible]);

  const patchKnowledge = useCallback(
    (patch) => {
      if (currentIndex < 0) {
        return;
      }
      setChapters((chapters) => {
        const target = chapters[currentIndex];
        if (!target) {
          return chapters;
        }
        target.content = patch.value;
        target.html = patch.html;
        target.toc = patch.toc;
        return chapters;
      });
    },
    [currentIndex]
  );

  const save = useCallback(() => {
    if (!chapters || !chapters.length) {
      return;
    }
    chapters.forEach((chapter, idx) => {
      chapter.order = idx;
    });
    setLoading(true);
    const promises = chapters.map((chapter) => {
      if (chapter.parentId) {
        return KnowledgeProvider.updateKnowledge(chapter.id, chapter);
      }
      return KnowledgeProvider.createChapters([{ ...chapter, parentId: id }]);
    });
    // eslint-disable-next-line consistent-return
    return Promise.all(promises as Array<Promise<IKnowledge>>).then((res) => {
      const data = res.flat(Infinity);
      setLoading(false);
      setChapters(data);
      forceUpdate();
      message.success('已保存');
      hasSavedRef.current = true;
    });
  }, [id, chapters, forceUpdate]);

  const goback = useCallback(() => {
    if (hasSavedRef.current) {
      Router.push('/admin/knowledge');
      return;
    }
    hasSavedRef.current = true;
    Modal.confirm({
      title: '确认关闭？如果有内容变更，请先保存!',
      onOk: () => {
        save().then(() => {
          Router.push('/admin/knowledge');
        });
      },
      onCancel: () => {
        window.removeEventListener('beforeunload', goback);
        Router.events.off('routeChangeStart', goback);
        Router.push('/admin/knowledge');
      },
      transitionName: '',
      maskTransitionName: '',
    });
    // ignore-me
    const newErr = new Error('请完成操作后关闭页面');
    throw newErr;
  }, [save]);

  useEffect(() => {
    window.addEventListener('beforeunload', goback);
    Router.events.on('routeChangeStart', goback);

    return () => {
      window.removeEventListener('beforeunload', goback);
      Router.events.off('routeChangeStart', goback);
    };
  }, [goback]);

  return (
    <div className={styles.wrapper}>
      <aside>
        <header>
          <div>
            <CloseOutlined onClick={goback} />
            <div>
              <Avatar shape="square" src={knowledge.cover} />
              <span style={{ marginLeft: 8 }}>{knowledge.title}</span>
            </div>
            <SettingOutlined style={{ cursor: 'pointer' }} onClick={toggleSettingVisible} />
            <KnowledgeSettingDrawer
              visible={settingVisible}
              toggleVisible={toggleSettingVisible}
              book={knowledge}
              onOk={setKnowledge}
            />
          </div>
          <div>
            <Button style={{ width: '100%' }} onClick={save} loading={loading}>
              保存
            </Button>
          </div>
          <div>
            <span>{chapters.length}篇文章</span>
            <Popover
              content={
                <div style={{ display: 'flex' }}>
                  <Input autoFocus={true} width={240} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                  <Button style={{ marginLeft: 8 }} type="primary" onClick={createNewKnowledge}>
                    新建
                  </Button>
                </div>
              }
              visible={popVisible}
              onVisibleChange={togglePopVisible}
              placement="rightTop"
              trigger="click"
            >
              <Button icon={<PlusOutlined />} size="small">
                新建
              </Button>
            </Popover>
          </div>
          <Divider style={{ margin: '16px 0' }} />
        </header>
        <main ref={$container}>
          <SortableList items={chapters} onSortEnd={onSortEnd} useDragHandle={true} lockAxis={'y'} />
        </main>
      </aside>

      <main>
        {currentChapter ? (
          <Editor defaultValue={(currentChapter && currentChapter.content) || ''} onChange={patchKnowledge} />
        ) : (
          <div className={styles.helper}>请新建章节（或者选择章节进行编辑）</div>
        )}
      </main>
    </div>
  );
};

Page.getInitialProps = async (ctx) => {
  const { id } = ctx.query;
  const knowledge = await KnowledgeProvider.getKnowledge(id);
  return { id, knowledge } as { id: string | number; knowledge: IKnowledge };
};

export default Page;
