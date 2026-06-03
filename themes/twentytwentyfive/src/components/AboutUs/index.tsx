import { CommentOutlined, GithubOutlined, ProfileOutlined, WechatOutlined } from '@/icons';
import { Card, Divider, Popover } from '@/ui';
import cls from 'classnames';
import { useTranslations } from 'next-intl';
import { type ReactNode } from 'react';

import style from './index.module.scss';

export interface AboutUsSetting {
  systemSubTitle?: string;
  systemFooterInfo?: string;
  aboutUsGithubUrl?: string;
  aboutUsCommentQr?: string;
  aboutUsWechatQr?: string;
}

interface IProps {
  setting?: AboutUsSetting;
  className?: string;
  hasBg?: boolean;
}

const trimUrl = (value?: string) => (value ?? '').trim();

export const RSS = () => {
  const t = useTranslations();

  return (
    <Popover content={t('rssSubscribe')}>
      <a aria-label="rss" className={style.github} href="/rss" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 1024 1024" width="24" height="24" aria-hidden>
          <path
            d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0z m-182.4 768C288 768 256 736 256 694.4s32-73.6 73.6-73.6 73.6 32 73.6 73.6-32 73.6-73.6 73.6z m185.6 0c0-144-115.2-259.2-259.2-259.2v-80c185.6 0 339.2 150.4 339.2 339.2h-80z m172.8 0c0-240-195.2-432-432-432V256c281.6 0 512 230.4 512 512h-80z"
            fill="currentColor"
          />
        </svg>
      </a>
    </Popover>
  );
};

export const GitHub = ({ url }: { url?: string }) => {
  const githubUrl = trimUrl(url);
  if (!githubUrl) return null;

  return (
    <Popover content="Github">
      <a
        aria-label="Github"
        className={style.github}
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
      >
        <GithubOutlined />
      </a>
    </Popover>
  );
};

export const Comment = ({ imageUrl }: { imageUrl?: string }) => {
  const qrUrl = trimUrl(imageUrl);
  if (!qrUrl) return null;

  return (
    <Popover content={<img height={200} width={200} src={qrUrl} alt="" />}>
      <span className={style.iconTrigger} role="img" aria-label="comment">
        <CommentOutlined />
      </span>
    </Popover>
  );
};

export const WeChat = ({ imageUrl }: { imageUrl?: string }) => {
  const qrUrl = trimUrl(imageUrl);
  if (!qrUrl) return null;

  return (
    <Popover content={<img height={200} width={300} src={qrUrl} alt="" />}>
      <span className={style.iconTrigger} role="img" aria-label="wechat">
        <WechatOutlined />
      </span>
    </Popover>
  );
};

export const ContactInfo = ({ setting }: { setting?: AboutUsSetting }) => {
  const contactItems = [
    <RSS key="rss" />,
    trimUrl(setting?.aboutUsGithubUrl) ? <GitHub key="github" url={setting?.aboutUsGithubUrl} /> : null,
    trimUrl(setting?.aboutUsCommentQr) ? <Comment key="comment" imageUrl={setting?.aboutUsCommentQr} /> : null,
    trimUrl(setting?.aboutUsWechatQr) ? <WeChat key="wechat" imageUrl={setting?.aboutUsWechatQr} /> : null,
  ].filter(Boolean) as ReactNode[];

  return (
    <div className={style.icons}>
      <ul>
        {contactItems.map((item, index) => (
          <li key={index} className={index > 0 ? style.contactItemSeparated : undefined}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const AboutUs = ({ setting, className = '', hasBg = false }: IProps) => {
  const t = useTranslations();
  return (
    <Card
      title={
        <span>
          <ProfileOutlined className={style.aboutUsIcon} />
          {t('aboutUs')}
        </span>
      }
      className={style.card}
    >
      <div className={style.wrapper}>
        {setting?.systemSubTitle ? (
          <p className={style.subtitle}>{setting.systemSubTitle}</p>
        ) : null}
        {setting?.systemFooterInfo && (
          <div
            className={style.copyright}
            dangerouslySetInnerHTML={{
              __html: setting.systemFooterInfo,
            }}
          ></div>
        )}
        <div className={cls(style.footer, className, hasBg && style.hasBg)}>
          <div className={style.container}>
            <Divider dashed />
            <ContactInfo setting={setting} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AboutUs;
