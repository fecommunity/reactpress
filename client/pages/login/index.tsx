import { Spin } from 'antd';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Router from 'next/router';
import { useContext, useEffect } from 'react';

import { GlobalContext } from '@/context/global';
import { UserProvider } from '@/providers/user';

import style from './index.module.scss';

interface IProps {
  code: string;
  from: string;
}

const Page: NextPage<IProps> = ({ code, from }: IProps) => {
  const t = useTranslations();
  const { setUser } = useContext(GlobalContext);

  useEffect(() => {
    if (!code) return;
    UserProvider.loginWithGithub(code)
      .then((res) => {
        setUser(res);
        Router.replace(from);
      })
      .catch((e) => {
        Router.replace('/');
      });
  }, [code, from, setUser]);

  return (
    <div id="js-page-wrapper" className={style.container}>
      <Spin size="large" tip={t('logingWithGithub') as string} />
    </div>
  );
};

Page.getInitialProps = (ctx) => {
  const { code, from } = ctx.query;
  return { code, from } as IProps;
};

export default Page;
