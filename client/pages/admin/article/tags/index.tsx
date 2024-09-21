import { Form } from 'antd';
import { Button, Card, Col, Input, message, Popconfirm, Row } from 'antd';
import cls from 'classnames';
import { NextPage } from 'next';
import React, { useCallback, useMemo, useState } from 'react';

import { AdminLayout } from '@/layout/AdminLayout';
import { TagProvider } from '@/providers/tag';

import style from './index.module.scss';

interface ITagProps {
  tags: ITag[];
}

const TagPage: NextPage<ITagProps> = ({ tags: defaultTags = [] }) => {
  const [tags, setTags] = useState(defaultTags);
  const [mode, setMode] = useState('create');
  const [currentTag, setCurrentTag] = useState(null);
  const [label, setLabel] = useState(null);
  const [value, setValue] = useState(null);

  const isCreateMode = useMemo(() => mode === 'create', [mode]);

  const getTags = useCallback(() => {
    TagProvider.getTags().then((tags) => {
      setTags(tags);
    });
  }, []);

  const reset = useCallback(() => {
    setMode('create');
    setCurrentTag(null);
    setLabel(null);
    setValue(null);
  }, []);

  const addTag = useCallback(
    (data) => {
      if (!data || !data.label) {
        return;
      }

      TagProvider.addTag(data).then(() => {
        message.success('添加标签成功');
        reset();
        getTags();
      });
    },
    [reset, getTags]
  );

  const updateTag = useCallback(
    (id, data) => {
      if (!data || !data.label) {
        return;
      }

      TagProvider.updateTag(id, data).then(() => {
        message.success('更新标签成功');
        reset();
        getTags();
      });
    },
    [reset, getTags]
  );

  const deleteTag = useCallback(
    (id) => {
      TagProvider.deleteTag(id).then(() => {
        message.success('删除标签成功');
        reset();
        getTags();
      });
    },
    [reset, getTags]
  );

  return (
    <AdminLayout>
      <Row gutter={16} className={style.wrapper}>
        <Col xs={24} sm={24} md={9}>
          <Card title={isCreateMode ? '添加标签' : '管理标签'} bordered={true}>
            <Form.Item>
              <Input
                value={label}
                placeholder={'输入标签名称'}
                onChange={(e) => {
                  setLabel(e.target.value);
                }}
              ></Input>
            </Form.Item>
            <Form.Item>
              <Input
                value={value}
                placeholder={'输入标签值（请输入英文，作为路由使用）'}
                onChange={(e) => {
                  setValue(e.target.value);
                }}
              ></Input>
            </Form.Item>
            <div className={cls(style.btns, isCreateMode ? false : style.isEdit)}>
              {isCreateMode ? (
                <Button type="primary" onClick={() => addTag({ label, value })}>
                  保存
                </Button>
              ) : (
                <>
                  <Button.Group>
                    <Button
                      type="primary"
                      onClick={() =>
                        updateTag(currentTag.id, {
                          label,
                          value,
                        })
                      }
                    >
                      更新
                    </Button>
                    <Button type="dashed" onClick={() => reset()}>
                      返回添加
                    </Button>
                  </Button.Group>
                  <Popconfirm
                    title="确认删除这个标签？"
                    onConfirm={() => deleteTag(currentTag.id)}
                    okText="确认"
                    cancelText="取消"
                  >
                    <Button danger={true}>删除</Button>
                  </Popconfirm>
                </>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={15}>
          <Card title="所有标签" bordered={true}>
            <ul className={style.list}>
              {tags.map((d) => (
                <li
                  key={d.id}
                  className={cls(style.item)}
                  onClick={() => {
                    setMode('edit');
                    setCurrentTag(d);
                    setLabel(d.label);
                    setValue(d.value);
                  }}
                >
                  <a key={d.id} className={style.tag}>
                    <span>{d.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
};

TagPage.getInitialProps = async () => {
  const tags = await TagProvider.getTags();
  return { tags };
};

export default TagPage;
