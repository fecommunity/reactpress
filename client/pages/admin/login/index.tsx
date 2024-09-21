import { Form } from '@ant-design/compatible';
import { FormComponentProps } from '@ant-design/compatible/es/form';
import { Button, Col, Input, Row } from 'antd';
import Link from 'next/link';
import { default as Router } from 'next/router';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { Svg } from '@/assets/LoginSvg';
import { GlobalContext } from '@/context/global';
import { UserProvider } from '@/providers/user';

import style from './index.module.scss';

type ILoginProps = FormComponentProps;

const _Login: React.FC<ILoginProps> = ({ form }) => {
  const { getFieldDecorator } = form;
  const globalContext = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.clear();
  }, []);

  const submit = useCallback(
    (e) => {
      e.preventDefault();
      form.validateFields((err, values) => {
        if (!err) {
          setLoading(true);
          UserProvider.login(values)
            .then((userInfo) => {
              localStorage.setItem('token', userInfo.token);
              setLoading(false);
              globalContext.setUser(userInfo);
              globalContext.getSetting();
              Router.push((Router.query.redirect as string) || '/');
            })
            .catch(() => setLoading(false));
        }
      });
    },
    [form, globalContext]
  );

  return (
    <div className={style.wrapper}>
      <Helmet>
        <title>系统登录</title>
      </Helmet>
      <Row className={style.container}>
        <Col xs={0} sm={0} md={12}>
          <Svg />
        </Col>
        <Col xs={24} sm={24} md={12}>
          <div style={{ width: '100%' }}>
            <h2>系统登录</h2>
            <Form layout="horizontal" onSubmit={submit}>
              <Form.Item label="账户">
                {getFieldDecorator('name', {
                  rules: [{ required: true, message: '请输入用户名！' }],
                })(<Input placeholder="请输入用户名" />)}
              </Form.Item>
              <Form.Item label="密码">
                {getFieldDecorator('password', {
                  rules: [{ required: true, message: '请输入密码！' }],
                })(<Input type="password" placeholder="请输入密码" />)}
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading} disabled={loading}>
                  登录
                </Button>
                Or{' '}
                <Link href="/admin/register">
                  <a>注册用户</a>
                </Link>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
      <ul className={style.bubbles}>
        {Array.from({ length: 10 }).map((_, idx) => (
          <li key={idx}></li>
        ))}
      </ul>
    </div>
  );
};

export default Form.create<ILoginProps>({ name: 'login' })(_Login);
