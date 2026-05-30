import { Button, Result } from 'antd';
import Head from 'next/head';
import { default as Router } from 'next/router';
import { useTranslations } from 'next-intl';
import React, { useContext } from 'react';

import { GlobalContext } from '@/context/global';
import { getPageTitle, getSiteTitle } from '@fecommunity/reactpress-toolkit/theme';

const style = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
} as React.CSSProperties;

export const Error404 = () => {
  const t = useTranslations();
  const { setting } = useContext(GlobalContext);

  return (
    <div style={style}>
      <Head>
        <title>{getPageTitle('404', setting)}</title>
      </Head>
      <Result
        status="404"
        title="404"
        subTitle={t('pageMissing')}
        extra={
          <Button type="primary" onClick={() => Router.replace('/')}>
            {t('backHome')}
          </Button>
        }
      />
    </div>
  );
};

const ServerError = ({ statusCode }) => {
  const t = useTranslations();
  const { setting } = useContext(GlobalContext);

  return (
    <div style={style}>
      <Head>
        <title>{getPageTitle(String(statusCode), setting)}</title>
      </Head>
      <Result
        status={statusCode}
        title={statusCode}
        subTitle={t('serverNotAvaliable')}
        extra={
          <Button type="primary" onClick={() => Router.replace('/')}>
            {t('backHome')}
          </Button>
        }
      />
    </div>
  );
};

function Error({ statusCode }) {
  const { setting } = useContext(GlobalContext);

  if (!statusCode) {
    return (
      <>
        <Head>
          <title>{getSiteTitle(setting)}</title>
        </Head>
        <p style={{ textAlign: 'center', padding: '1rem 0' }}>An error occurred on client</p>
      </>
    );
  }

  if (+statusCode === 404) {
    return <Error404 />;
  }

  return <ServerError statusCode={404} />;
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
