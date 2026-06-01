import { BellFilled } from '@/icons';
import { siteNoticeDisplayLines } from '@fecommunity/reactpress-toolkit/theme';
import { Alert } from '@/ui';
import React, { useContext } from 'react';
import { TextLoop } from '@/ui';

import { SiteCatalogContext as GlobalContext } from '@fecommunity/reactpress-toolkit/theme';

import style from './index.module.scss';

const SystemNotification: React.FC = () => {
  const { setting } = useContext(GlobalContext);
  const notices = siteNoticeDisplayLines(setting?.systemNoticeInfo);
  return notices?.length ? (
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
