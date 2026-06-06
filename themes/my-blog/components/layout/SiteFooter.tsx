'use client';

import PageContainer from '@/components/layout/PageContainer';
import Link from '@/components/shared/Link';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { getSiteTitle, useSiteSetting } from '@fecommunity/reactpress-toolkit/theme';

export default function SiteFooter() {
  const { t } = useLocale();
  const setting = useSiteSetting();
  const siteTitle = getSiteTitle(setting);

  return (
    <footer className="mt-auto w-full shrink-0 border-t border-[var(--border-color)] bg-[var(--bg-box)] py-8" role="contentinfo">
      <PageContainer>
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 font-semibold text-[var(--main-text-color)]">{t('aboutUs')}</div>
          {setting?.systemSubTitle ? (
            <p className="m-0 mb-2 text-sm leading-relaxed text-[var(--second-text-color)]">
              {setting.systemSubTitle}
            </p>
          ) : null}
          {setting?.systemFooterInfo ? (
            <div
              className="rp-rich-text text-sm leading-relaxed text-[var(--second-text-color)]"
              dangerouslySetInnerHTML={{ __html: setting.systemFooterInfo }}
            />
          ) : (
            <p className="m-0 text-sm text-[var(--second-text-color)]">
              {siteTitle} — Powered by ReactPress
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <a href="/rss" target="_blank" rel="noopener noreferrer" aria-label="rss" className="rp-footer-icon text-[var(--main-text-color)] hover:text-[var(--primary-color)]">
            <svg viewBox="0 0 1024 1024" width="24" height="24" fill="currentColor" aria-hidden>
              <path d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0z m-182.4 768C288 768 256 736 256 694.4s32-73.6 73.6-73.6 73.6 32 73.6 73.6-32 73.6-73.6 73.6z m185.6 0c0-144-115.2-259.2-259.2-259.2v-80c185.6 0 339.2 150.4 339.2 339.2h-80z m172.8 0c0-240-195.2-432-432-432V256c281.6 0 512 230.4 512 512h-80z" />
            </svg>
          </a>
          {setting?.aboutUsGithubUrl?.trim() ? (
            <a
              href={setting.aboutUsGithubUrl.trim()}
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label="Github"
              className="rp-footer-icon text-[var(--main-text-color)] hover:text-[var(--primary-color)]"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          ) : null}
        </div>
      </div>
      <div className="mt-6 text-center text-xs text-[var(--second-text-color)]">
        <Link href="/" className="rp-inline-link rp-inline-link--muted">
          {siteTitle}
        </Link>
        {' · '}
        {`© ${new Date().getFullYear()}`}
      </div>
      </PageContainer>
    </footer>
  );
}
