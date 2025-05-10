import Icon, { CommentOutlined, GithubOutlined, ProfileOutlined, WechatOutlined } from '@ant-design/icons';
import { Card, Divider, Popover } from 'antd';
import cls from 'classnames';
import { useTranslations } from 'next-intl';
import style from './index.module.scss';

interface IProps {
  setting: any;
  className?: string;
  hasBg?: boolean;
}

export const RSS = () => {
  const t = useTranslations();

  return (
    <Popover content={t('rssSubscribe')}>
      <li>
        <a aria-label="rss" className={style.github} href="/rss" target="_blank" rel="noopener noreferrer">
          <Icon
            component={() => (
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width="24"
                height="24"
              >
                <defs>
                  <style type="text/css"></style>
                </defs>
                <path
                  d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0z m-182.4 768C288 768 256 736 256 694.4s32-73.6 73.6-73.6 73.6 32 73.6 73.6-32 73.6-73.6 73.6z m185.6 0c0-144-115.2-259.2-259.2-259.2v-80c185.6 0 339.2 150.4 339.2 339.2h-80z m172.8 0c0-240-195.2-432-432-432V256c281.6 0 512 230.4 512 512h-80z"
                  fill="currentColor"
                ></path>
              </svg>
            )}
          />
        </a>
      </li>
    </Popover>
  );
};

export const GitHub = () => {
  return (
    <Popover content="Github">
      <li>
        <a
          aria-label="Github"
          className={style.github}
          href="https://github.com/fecommunity/reactpress"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          <GithubOutlined />
        </a>
      </li>
    </Popover>
  );
};

export const Comment = () => {
  return (
    <Popover
      content={
        <img height={200} width={200} src="https://www.gaoredu.com/wp-content/uploads/2024/08/WechatIMG23.jpg" />
      }
    >
      <li>
        <CommentOutlined />
      </li>
    </Popover>
  );
};

export const WeChat = () => {
  return (
    <Popover
      content={<img height={200} width={300} src="https://www.gaoredu.com/wp-content/uploads/2024/11/wechat.png" />}
    >
      <li>
        <WechatOutlined />
      </li>
    </Popover>
  );
};

export const ContactInfo = () => {
  return (
    <div className={style.icons}>
      <ul>
        <RSS />

        <Divider type="vertical" />

        <GitHub />

        <Divider type="vertical" />

        <Comment />

        <Divider type="vertical" />

        <WeChat />
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
            <ContactInfo />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AboutUs;
