import { Button, Card, Col, Form, Input, message, Popconfirm, Row } from 'antd';
import cls from 'classnames';
import { NextPage } from 'next';
import { useCallback, useMemo, useState } from 'react';

import { AdminLayout } from '@/layout/AdminLayout';
import { CategoryProvider } from '@/providers/category';

import style from './index.module.scss';

interface IProps {
  data: ICategory[];
}

const Page: NextPage<IProps> = ({ data: defaultData = [] }) => {
  const [data, setData] = useState(defaultData);
  const [mode, setMode] = useState('create');
  const [current, setCurrent] = useState(null);
  const [label, setLabel] = useState(null);
  const [value, setValue] = useState(null);

  const isCreateMode = useMemo(() => mode === 'create', [mode]);

  const getData = useCallback(() => {
    CategoryProvider.getCategory().then((res) => {
      setData(res);
    });
  }, []);

  const reset = useCallback(() => {
    setMode('create');
    setCurrent(null);
    setLabel(null);
    setValue(null);
  }, []);

  const addTag = useCallback(
    (data) => {
      if (!data || !data.label) {
        return;
      }

      CategoryProvider.add(data).then(() => {
        message.success('添加分类成功');
        reset();
        getData();
      });
    },
    [reset, getData]
  );

  const updateTag = useCallback(
    (id, data) => {
      if (!data || !data.label) {
        return;
      }

      CategoryProvider.update(id, data).then(() => {
        message.success('更新分类成功');
        reset();
        getData();
      });
    },
    [reset, getData]
  );

  const deleteTag = useCallback(
    (id) => {
      CategoryProvider.delete(id).then(() => {
        message.success('删除分类成功');
        reset();
        getData();
      });
    },
    [reset, getData]
  );

  return (
    <AdminLayout>
      <Row gutter={16} className={style.wrapper}>
        <Col xs={24} sm={24} md={9}>
          <Card title={isCreateMode ? '添加分类' : '管理分类'} bordered={true}>
            <Form.Item>
              <Input
                value={label}
                placeholder={'输入分类名称'}
                onChange={(e) => {
                  setLabel(e.target.value);
                }}
              ></Input>
            </Form.Item>
            <Form.Item>
              <Input
                value={value}
                placeholder={'输入分类值（请输入英文，作为路由使用）'}
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
                        updateTag(current.id, {
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
                    title="确认删除这个分类？"
                    onConfirm={() => deleteTag(current.id)}
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
          <Card title="所有分类" bordered={true}>
            <ul className={style.list}>
              {data.map((d) => (
                <li
                  key={d.id}
                  className={cls(style.item)}
                  onClick={() => {
                    setMode('edit');
                    setCurrent(d);
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

Page.getInitialProps = async () => {
  const data = await CategoryProvider.getCategory();
  return { data };
};

export default Page;
