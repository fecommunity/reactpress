import { Button, Result } from 'antd';
import { useTranslations } from 'next-intl';
import { default as Router } from 'next/router';
import React from 'react';

const style = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
} as React.CSSProperties;

export const Error404 = () => {
  const t = useTranslations();

  return (
    <div style={style}>
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

  return (
    <div style={style}>
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
  if (!statusCode) {
    return <p style={{ textAlign: 'center', padding: '1rem 0' }}>An error occurred on client</p>;
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
