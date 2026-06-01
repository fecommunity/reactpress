import { CheckCircleOutlined,GithubOutlined, UserOutlined } from '@/icons';
import { Alert, Avatar, Button, Divider, Dropdown, Form, Input, message, Modal, Space } from '@/ui';
import Router, { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { SiteCatalogContext as GlobalContext, resolveImageUrl, useToggle } from '@fecommunity/reactpress-toolkit/theme';
import { UserProvider } from '@/providers';

import styles from './index.module.scss';

const emailRegexp = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;

/** Admin SPA URL (nginx `/admin/` in production; dev may still use :3000 with redirect). */
function resolveAdminHref(): string {
  const configured = process.env.NEXT_PUBLIC_REACTPRESS_ADMIN_URL?.trim();
  if (configured) {
    return configured.endsWith('/') ? configured : `${configured}/`;
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/admin/`;
  }
  return 'http://localhost/admin/';
}

export type IUser = {
  name: string;
  email: string;
};

export const isValidUser = (user: IUser): user is IUser => user && user.name && emailRegexp.test(user.email);

/** Logged-in session for comment UI (token + name; email validated on submit). */
export function isLoggedInUser(user: Partial<IUser> | null | undefined): user is IUser {
  return Boolean(user?.name?.trim() && user?.token?.trim());
}

export const UserInfo: React.FC<{
  defaultVisible?: boolean;
  hidden?: boolean;
  onOk?: (arg: IUser) => void;
  onCancel?: () => void;
}> = ({ defaultVisible = false, hidden = false, onOk = () => {}, onCancel = () => {} }) => {
  const tRoot = useTranslations();
  const t = useTranslations('commentNamespace');
  const { user, setUser, removeUser } = useContext(GlobalContext);
  const [visible, toggleVisible] = useToggle(defaultVisible);
  const [loginVisible, toggleLoginVisible] = useToggle(false);
  const globalContext = useContext(GlobalContext);

  const submit = useCallback(
    (values) => {
      UserProvider.login(values).then((res) => {
        setUser(res);
        onOk(res);
        toggleVisible(false);
        message.success(t('loginSuccess'));

        // 存储token
        localStorage.setItem('token', res.token);
        globalContext.setUser(res);

        // 这里区分地址栏是否有redirect
        const redirectUrl = getSearchParams().get('redirect');
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      });
    },
    [toggleVisible, onOk, setUser]
  );

  const submitRegister = useCallback(
    (values: Record<string, string>) => {
      if (values.password !== values.confirm) {
        message.error(t('confirmPasswordIsNotMatchTips') as string);
        return;
      }
      UserProvider.register(values).then((res) => {
        message.success(t('registerSuccessTips'));
        toggleLoginVisible(false);
        toggleVisible(true);
      });
    },
    [toggleLoginVisible, onOk, setUser]
  );

  const loginWithGithub = useCallback(() => {
    Router.replace(
      `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${location.origin}/login?from=${location.href}`
    );
  }, []);

  const getSearchParams = (link: string = window.location.href) => {
    const path = decodeURIComponent(link);
    const url = new URL(path);
    const searchParams = new URLSearchParams(url.search);
    return searchParams;
  };

  const handleQueryChange = () => {
    const searchParams = getSearchParams();
    const action = searchParams.get('action');
    if (action === 'login') {
      setTimeout(() => {
        toggleVisible(true);
      }, 0);
    }
  };

  useEffect(() => {
    handleQueryChange();
  }, []);

  const trigger = hidden ? (
    user && user.avatar ? (
      <Avatar size={24} src={resolveImageUrl(user.avatar, 'avatar')}></Avatar>
    ) : (
      <Avatar size={24} icon={<UserOutlined />}></Avatar>
    )
  ) : user ? (
    <Dropdown
      menu={{
        onClick: ({ key }) => {
          if (key === 'logout') {
            removeUser?.();
          }
        },
        items: [
          {
            key: 'profile',
            label: (
              <a
                href={resolveAdminHref()}
                target="_blank"
                rel="noreferrer"
              >
                {user.name}
              </a>
            ),
          },
          {
            key: 'logout',
            label: t('logout'),
          },
        ],
      }}
    >
      {user.avatar ? <Avatar alt={user.name} size={24} src={resolveImageUrl(user.avatar, 'avatar')}></Avatar> : <Avatar size={24}>{user.name?.charAt(0)}</Avatar>}
    </Dropdown>
  ) : (
    <Space.Compact>
      <Button onClick={toggleVisible} size="middle">
        {t('userInfoConfirm')}
      </Button>
      <Button onClick={toggleLoginVisible} size="middle">
        {t('register')}
      </Button>
    </Space.Compact>
  );

  useEffect(() => {
    toggleVisible(defaultVisible);
  }, [defaultVisible, toggleVisible]);

  return (
    <>
      {trigger}
      <Modal
        title={t('userInfoTitle')}
        okText={t('userInfoConfirm')}
        cancelText={t('userInfoCancel')}
        open={visible}
        footer={null}
        onCancel={() => {
          toggleVisible();
          onCancel();
        }}
        transitionName={''}
        maskTransitionName={''}
        width="26.5em"
        destroyOnHidden
        className={styles.userModal}
      >
        <Form name="user-info" onFinish={submit}>
          <Form.Item name="name" rules={[{ required: true, message: t('userInfoNameValidMsg') as string }]}>
            <Input placeholder={t('userInfoName') as string} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: t('userInfoPasswordValidMsg') as string }]}>
          <Input.Password className={styles.password}  placeholder={t('userInfoPassword') as string} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {t('userInfoConfirm')}
            </Button>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            {t('areYouNoAccount')}
            <a
              className={styles.link}
              onClick={() => {
                toggleVisible(false);
                toggleLoginVisible(true);
              }}
            >
              {t('registerNow')}
            </a>
          </Form.Item>
        </Form>
        <div className={styles.other}>
          <Divider plain dashed>
            {t('openAuth')}
          </Divider>
          <div className={styles.icon} onClick={loginWithGithub}>
            <span title={tRoot('useGithubToLogin') as string}>
              <GithubOutlined />
            </span>
          </div>
        </div>
      </Modal>
      <Modal
        title={t('userRegister')}
        okText={t('userInfoConfirm')}
        cancelText={t('userInfoCancel')}
        open={loginVisible}
        footer={null}
        onCancel={() => {
          toggleLoginVisible();
          onCancel();
        }}
        transitionName={''}
        maskTransitionName={''}
        width="26.5em"
        destroyOnHidden
        className={styles.userModal}
      >
        <Form name="user-info" onFinish={submitRegister}>
          <Form.Item name="name" rules={[{ required: true, message: t('userInfoNameValidMsg') as string }]}>
            <Input placeholder={t('userInfoName') as string} />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              {
                type: 'email',
                message: t('userInfoIllegalEmailValidMsg') as string,
              },
              {
                required: true,
                message: t('userInfoEmailValidMsg') as string,
              },
            ]}
          >
            <Input type='email' placeholder={t('userInfoEmail') as string} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: t('userInfoPasswordValidMsg') as string }]}>
            <Input.Password className={styles.password} placeholder={t('userInfoPassword') as string} />
          </Form.Item>
          <Form.Item name="confirm">
            <Input.Password className={styles.password} placeholder={t('userInfoPleaseEnterConfirmPassword') as string} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {t('register')}
            </Button>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            {t('areYouHasAccount')}
            <a
              className={styles.link}
              onClick={() => {
                toggleLoginVisible(false);
                toggleVisible(true);
              }}
            >
              {t('loginNow')}
            </a>
          </Form.Item>
        </Form>
        {visible && (
          <div className={styles.other}>
            <div className={styles.icon} onClick={loginWithGithub}>
            <span title={tRoot('useGithubToLogin') as string}>
              <GithubOutlined />
            </span>
            </div>
            <Alert style={{ marginTop: 16 }} message={<p>{tRoot('loginTipMessage')}</p>} type="info" showIcon={true} />
          </div>
        )}
      </Modal>
    </>
  );
};
