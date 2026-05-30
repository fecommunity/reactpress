import { useAppLocale } from "@/hooks/useAppLocale";
import { REACTPRESS_DEMO_URL, REACTPRESS_GITHUB_URL, reactpressDocsPath } from "@/utils/constants";

type LoginHeroLinksProps = {
  className?: string;
  mutedLinkClassName?: string;
};

export function LoginHeroLinks({ className, mutedLinkClassName }: LoginHeroLinksProps) {
  const { t, locale } = useAppLocale();

  return (
    <nav className={className} aria-label={t("login.showcase.linksAria")}>
      <a href={reactpressDocsPath(locale, "/docs/tutorial-basics/start")}>
        {t("login.showcase.getStarted")}
      </a>
      <a href={reactpressDocsPath(locale, "/docs/tutorial-extras/reactpress-3-0")}>
        {t("login.showcase.whatsNew")}
      </a>
      <a href={REACTPRESS_DEMO_URL} target="_blank" rel="noopener noreferrer">
        {t("login.showcase.liveDemo")}
      </a>
      <a
        href={REACTPRESS_GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={mutedLinkClassName}
      >
        {t("login.showcase.github")}
      </a>
    </nav>
  );
}
