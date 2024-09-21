import Icon, { GithubOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import cls from 'classnames';
import React from 'react';

import style from './index.module.scss';

const RSS = () => {
  return (
    <Icon
      component={() => (
        <svg viewBox="0 0 1024 1024" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink" width="24" height="24">
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
  );
};

export const Footer = ({ setting, className = '', hasBg = false }) => {
  return (
    <footer className={cls(style.footer, className, hasBg && style.hasBg)}>
      <div className="container">
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
        <ul className={style.icons}>
          <ul>
            <Popover content={'RSS订阅'}>
              <li>
                <a aria-label="rss" className={style.github} href="/rss" target="_blank" rel="noopener noreferrer">
                  <RSS />
                </a>
              </li>
            </Popover>

            <Popover content="Github">
              <li>
                <a
                  aria-label="Github"
                  className={style.github}
                  href="https://github.com/fecommunity/easy-blog"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubOutlined />
                </a>
              </li>
            </Popover>
          </ul>
        </ul>
      </div>
    </footer>
  );
};
