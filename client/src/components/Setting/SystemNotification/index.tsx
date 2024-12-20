import { GlobalContext } from '@/context/global';
import { BellFilled } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { useContext } from 'react';
import TextLoop from 'react-text-loop';
import style from './index.module.scss';

const SystemNotification: React.FC = () => {
  const { setting } = useContext(GlobalContext);
  const notices = setting?.systemNoticeInfo?.split('\n').filter(Boolean);
  return !!notices?.length ? (
    <Alert
      className={style.alert}
      closeIcon
      banner
      type="info"
      icon={<BellFilled size={16} />}
      message={
        <div className={style.textLoop}>
          <TextLoop interval={5000}>
            {notices.map((notice, index) => (
              <span key={index} className={style.overflowEllipse} dangerouslySetInnerHTML={{ __html: notice }} />
            ))}
          </TextLoop>
        </div>
      }
    />
  ) : null;
};
export default SystemNotification;
