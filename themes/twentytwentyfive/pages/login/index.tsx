import { Spin } from '@/ui';
import { NextPage } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import { useTranslations } from 'next-intl';
import { getPageTitle, useSiteSetting, useSiteUser } from '@fecommunity/reactpress-toolkit/theme';
import { UserProvider } from '@/providers';
import { useEffect } from 'react';

import style from './index.module.scss';

interface IProps {
  code: string;
  from: string;
}

const Page: NextPage<IProps> = ({ code, from }: IProps) => {
  const t = useTranslations();
  const { setUser } = useSiteUser();
  const setting = useSiteSetting();

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
      <Head>
        <title>{getPageTitle(t('logingWithGithub'), setting)}</title>
      </Head>
      <Spin size="large" tip={t('logingWithGithub') as string} />
    </div>
  );
};

Page.getInitialProps = (ctx) => {
  const { code, from } = ctx.query;
  return { code, from } as IProps;
};

export default Page;
