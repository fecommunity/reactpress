'use client';

import type { ReactNode } from 'react';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { useSiteSetting } from '@fecommunity/reactpress-toolkit/theme';

function trimUrl(value?: string) {
  return (value ?? '').trim();
}

function QrPopover({ imageUrl, label, children }: { imageUrl: string; label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="rp-glass pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 rounded-xl p-2 shadow-lg group-hover:block"
      >
        <img src={imageUrl} alt={label} className="max-h-[200px] max-w-[300px]" />
      </span>
    </span>
  );
}

function ContactInfo() {
  const { t } = useLocale();
  const setting = useSiteSetting();
  const githubUrl = trimUrl(setting?.aboutUsGithubUrl);
  const commentQr = trimUrl(setting?.aboutUsCommentQr);
  const wechatQr = trimUrl(setting?.aboutUsWechatQr);

  const items = [
    <a
      key="rss"
      href="/rss"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="rss"
      title={t('rssSubscribe')}
      className="inline-flex text-[var(--main-text-color)] hover:text-[var(--primary-color)]"
    >
      <svg viewBox="0 0 1024 1024" width="24" height="24" fill="currentColor" aria-hidden>
        <path d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0z m-182.4 768C288 768 256 736 256 694.4s32-73.6 73.6-73.6 73.6 32 73.6 73.6-32 73.6-73.6 73.6z m185.6 0c0-144-115.2-259.2-259.2-259.2v-80c185.6 0 339.2 150.4 339.2 339.2h-80z m172.8 0c0-240-195.2-432-432-432V256c281.6 0 512 230.4 512 512h-80z" />
      </svg>
    </a>,
    githubUrl ? (
      <a
        key="github"
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        aria-label="Github"
        title="Github"
        className="inline-flex text-[var(--main-text-color)] hover:text-[var(--primary-color)]"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </a>
    ) : null,
    commentQr ? (
      <QrPopover key="comment" imageUrl={commentQr} label="comment">
        <span
          role="img"
          aria-label="comment"
          title={t('comment')}
          className="inline-flex cursor-pointer text-2xl text-[var(--main-text-color)] hover:text-[var(--primary-color)]"
        >
          💬
        </span>
      </QrPopover>
    ) : null,
    wechatQr ? (
      <QrPopover key="wechat" imageUrl={wechatQr} label="wechat">
        <span
          role="img"
          aria-label="wechat"
          title="WeChat"
          className="inline-flex cursor-pointer text-2xl text-[var(--main-text-color)] hover:text-[var(--primary-color)]"
        >
          💚
        </span>
      </QrPopover>
    ) : null,
  ].filter(Boolean);

  if (!items.length) return null;

  return (
    <div className="mt-4 border-t border-dashed border-[var(--border-color)] pt-4">
      <ul className="m-0 flex list-none items-center justify-between p-0">
        {items.map((item, index) => (
          <li
            key={index}
            className={index > 0 ? 'ml-3 border-l border-[var(--border-color)] pl-3' : undefined}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface AboutUsProps {
  variant?: 'sidebar' | 'default' | 'bottom';
}

function AboutUsBody() {
  const { t } = useLocale();
  const setting = useSiteSetting();

  return (
    <>
      {setting?.systemSubTitle ? (
        <p className="mt-0 mb-3 leading-relaxed">{setting.systemSubTitle}</p>
      ) : null}
      {setting?.systemFooterInfo ? (
        <div
          className="rp-rich-text leading-relaxed"
          dangerouslySetInnerHTML={{ __html: setting.systemFooterInfo }}
        />
      ) : (
        <p className="m-0 leading-relaxed">{t('aboutUsFallback')}</p>
      )}
      <ContactInfo />
    </>
  );
}

export default function AboutUs({ variant = 'default' }: AboutUsProps) {
  const { t } = useLocale();
  const isSidebar = variant === 'sidebar';
  const isBottom = variant === 'bottom';

  if (isBottom) {
    return (
      <div className="rp-widget-panel overflow-hidden rounded-xl bg-[var(--bg-box)] text-[var(--second-text-color)] shadow-[var(--box-shadow)] ring-1 ring-black/5 dark:ring-white/5">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:gap-8 md:p-6">
          <h3 className="m-0 shrink-0 text-base font-bold text-[var(--main-text-color)] md:w-40">
            {t('aboutUs')}
          </h3>
          <div className="min-w-0 flex-1 text-sm">
            <AboutUsBody />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rp-widget-panel overflow-hidden rounded-xl bg-[var(--bg-box)] shadow-[var(--box-shadow)] ring-1 ring-black/5 dark:ring-white/5 ${
        isSidebar ? 'border-t-0 text-[var(--second-text-color)]' : ''
      }`}
    >
      <div className="border-b border-[var(--border-color)] p-4 font-bold text-[var(--main-text-color)]">
        {t('aboutUs')}
      </div>
      <div className="p-4 text-sm text-[var(--second-text-color)]">
        <AboutUsBody />
      </div>
    </div>
  );
}
