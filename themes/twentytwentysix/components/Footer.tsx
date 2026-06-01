import { useSiteCatalog, useSiteSetting } from '@fecommunity/reactpress-toolkit/theme';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations();
  const setting = useSiteSetting();
  const { siteConfig } = useSiteCatalog();
  const githubUrl =
    (siteConfig as { aboutUsGithubUrl?: string } | undefined)?.aboutUsGithubUrl ||
    setting?.aboutUsGithubUrl;
  const footerHtml = setting?.systemFooterInfo;

  return (
    <footer className="mt-auto border-t border-border/60 bg-secondary/30">
      <div className="site-container flex flex-col gap-3 py-8 text-sm text-muted-foreground">
        {footerHtml ? (
          <div className="prose-content" dangerouslySetInnerHTML={{ __html: footerHtml }} />
        ) : null}
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            {t('poweredBy') || 'Powered by'}{' '}
            <Link href="https://github.com/fecommunity/reactpress">
              <a className="font-medium" rel="noopener noreferrer" target="_blank">
                ReactPress
              </a>
            </Link>
          </span>
          {githubUrl ? (
            <>
              <span aria-hidden="true">·</span>
              <Link href={githubUrl}>
                <a rel="noopener noreferrer" target="_blank">
                  GitHub
                </a>
              </Link>
            </>
          ) : null}
        </p>
      </div>
    </footer>
  );
}
