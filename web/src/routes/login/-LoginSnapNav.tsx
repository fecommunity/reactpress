import { useCallback, useEffect, useState } from "react";

import { useAppLocale } from "@/hooks/useAppLocale";

import styles from "./login-snap-nav.module.css";

const SCREEN_ATTR = "data-login-screen";

export type LoginScreenId = "auth" | "hero" | "features";

type LoginSnapNavProps = {
  scrollerRef: React.RefObject<HTMLElement | null>;
  authScreenLabelKey?: string;
};

export function LoginSnapNav({
  scrollerRef,
  authScreenLabelKey = "login.scroll.screenAuth",
}: LoginSnapNavProps) {
  const { t } = useAppLocale();
  const [active, setActive] = useState<LoginScreenId>("auth");

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const sections = Array.from(root.querySelectorAll<HTMLElement>(`[${SCREEN_ATTR}]`));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = visible.target.getAttribute(SCREEN_ATTR) as LoginScreenId | null;
        if (id) setActive(id);
      },
      { root, threshold: [0.45, 0.6, 0.75] },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [scrollerRef]);

  const scrollTo = useCallback(
    (id: LoginScreenId) => {
      const root = scrollerRef.current;
      if (!root) return;
      const target = root.querySelector<HTMLElement>(`[${SCREEN_ATTR}="${id}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [scrollerRef],
  );

  const screens: { id: LoginScreenId; label: string }[] = [
    { id: "auth", label: t(authScreenLabelKey) },
    { id: "hero", label: t("login.scroll.screenHero") },
    { id: "features", label: t("login.scroll.screenFeatures") },
  ];

  return (
    <nav className={styles.nav} aria-label={t("login.scroll.navAria")}>
      <ol className={styles.list}>
        {screens.map((screen) => (
          <li key={screen.id}>
            <button
              type="button"
              className={styles.dot}
              data-active={active === screen.id}
              aria-current={active === screen.id ? "true" : undefined}
              aria-label={screen.label}
              onClick={() => scrollTo(screen.id)}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
}
