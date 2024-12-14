import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { AnalyticsSetting } from '@/components/Setting/AnalyticsSetting';
import { LocaleSetting } from '@/components/Setting/LocaleSetting';
import { OSSSetting } from '@/components/Setting/OSSSetting';
import { SEOSetting } from '@/components/Setting/SEOSetting';
import { SMTPSetting } from '@/components/Setting/SMTPSetting';
import { SystemSetting } from '@/components/Setting/SystemSetting';
import { GlobalSetting } from '@/components/Setting/GlobalSetting';
import { useSetting } from '@/hooks/useSetting';
import { AdminLayout } from '@/layout/AdminLayout';

import style from './index.module.scss';

interface IProps {
  type: string;
}


const Setting: NextPage<IProps> = ({ type: defaultType }) => {
  const router = useRouter();
  const [type, setType] = useState(defaultType);
  const setting = useSetting();

  const tabs = [
    {
      label: '系统设置',
      content: <SystemSetting setting={setting} />,
    },
    {
      label: '国际化设置',
      content: <LocaleSetting setting={setting} />,
    },
    {
      label: 'SEO设置',
      content: <SEOSetting setting={setting} />,
    },
    {
      label: '数据统计',
      content: <AnalyticsSetting setting={setting} />,
    },
    {
      label: 'OSS设置',
      content: <OSSSetting setting={setting} />,
    },
    {
      label: '全局设置',
      content: <GlobalSetting setting={setting} />,
    },
    {
      label: 'SMTP服务',
      content: <SMTPSetting setting={setting} />,
    },
  ];

  const tabAccount = tabs.find((tab) => tab.label === type)?.content || tabs[0]?.content;

  const getSearchParams = (link: string = window.location.href) => {
    const path = decodeURIComponent(link);
    const url = new URL(path);
    const searchParams = new URLSearchParams(url.search);
    return searchParams;
  };

  const handleQueryChange = () => {
    const searchParams = getSearchParams();
    const type = searchParams.get('type');
    setType(type);
  };

  useEffect(() => {
    handleQueryChange();
  }, [router.asPath]);

  return <AdminLayout>{setting ? <div className={style.wrapper}>{tabAccount}</div> : <></>}</AdminLayout>;
};

Setting.getInitialProps = async (ctx) => {
  const { type } = ctx.query;
  return { type: '' + (type || '系统设置') };
};

export default Setting;
