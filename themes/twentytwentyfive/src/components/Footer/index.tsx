/**
 * Footer Component
 * 
 * This component represents the main footer of the application.
 * It includes:
 * - About Us section
 * - System footer information
 * - Contact information
 * 
 * Features:
 * - Responsive design
 * - Customizable background
 * - HTML content support for footer info
 */

import { ContactInfo } from '@/components/AboutUs';
import cls from 'classnames';
import { useTranslations } from 'next-intl';
import React from 'react';

import style from './index.module.scss';

interface FooterProps {
  setting: {
    systemFooterInfo?: string;
  };
  className?: string;
  hasBg?: boolean;
}

/**
 * Footer Component
 * 
 * @param {FooterProps} props - Component props
 * @param {Object} props.setting - Footer settings
 * @param {string} [props.setting.systemFooterInfo] - HTML content for footer info
 * @param {string} [props.className] - Additional CSS class name
 * @param {boolean} [props.hasBg] - Whether to show background
 */
export const Footer: React.FC<FooterProps> = ({ 
  setting, 
  className = '', 
  hasBg = false 
}) => {
  const t = useTranslations();

  return (
    <footer 
      className={cls(style.footer, className, hasBg && style.hasBg)}
      role="contentinfo"
    >
      <div className={cls('container', style.container)}>
        {/* Left Section - About Us and Copyright */}
        <ul className={style.left}>
          <span className={style.title}>{t('aboutUs')}</span>
          {setting?.systemFooterInfo && (
            <div
              className={style.copyright}
              dangerouslySetInnerHTML={{
                __html: setting.systemFooterInfo,
              }}
              aria-label="Footer information"
            />
          )}
        </ul>

        {/* Right Section - Contact Information */}
        <ContactInfo />
      </div>
    </footer>
  );
};
