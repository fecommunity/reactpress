import { ContactInfo } from '@/components/AboutUs';
import cls from 'classnames';

import style from './index.module.scss';

export const Footer = ({ setting, className = '', hasBg = false }) => {
  return (
    <footer className={cls(style.footer, className, hasBg && style.hasBg)}>
      <div className={cls('container', style.container)}>
        <ul className={style.left}>
          <span className={style.title}>关于我们</span>
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
