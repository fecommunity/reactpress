import { ContactInfo } from '@/components/AboutUs';
import cls from 'classnames';

import style from './index.module.scss';
import { useTranslations } from 'next-intl';

export const Footer = ({ setting, className = '', hasBg = false }) => {
  const t = useTranslations();
  return (
    <footer className={cls(style.footer, className, hasBg && style.hasBg)}>
      <div className={cls('container', style.container)}>
        <ul className={style.left}>
          <span className={style.title}>{t('aboutUs')}</span>
          {setting && setting.systemFooterInfo && (
            <div
              className={style.copyright}
              dangerouslySetInnerHTML={{
                __html: setting.systemFooterInfo,
              }}
            ></div>
          )}
        </ul>
        <ContactInfo />
      </div>
    </footer>
  );
};
