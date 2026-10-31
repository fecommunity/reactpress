import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
import Translate from '@docusaurus/Translate';
import { IconDesktop, IconPlugins, IconRocket, IconThemes } from '@site/src/components/Home/icons';
import React from 'react';

import styles from './styles.module.css';

type HubItem = {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  to: string;
  cta: string;
  accent: 'themes' | 'plugins' | 'templates' | 'guides';
};

const items: HubItem[] = [
  {
    Icon: IconThemes,
    title: translate({ message: 'Themes', id: 'home.ecosystem.themes.title' }),
    description: translate({
      message: 'Install Next.js SSR themes from npm — swap looks without rewriting your CMS.',
      id: 'home.ecosystem.themes.desc',
    }),
    to: '/themes',
    cta: translate({ message: 'Explore themes', id: 'home.ecosystem.themes.cta' }),
    accent: 'themes',
  },
  {
    Icon: IconPlugins,
    title: translate({ message: 'Plugins', id: 'home.ecosystem.plugins.title' }),
    description: translate({
      message: 'Extend Admin and API with Hooks — SEO, summaries, image pipelines, and custom slots.',
      id: 'home.ecosystem.plugins.desc',
    }),
    to: '/plugins',
    cta: translate({ message: 'Explore plugins', id: 'home.ecosystem.plugins.cta' }),
    accent: 'plugins',
  },
  {
    Icon: IconRocket,
    title: translate({ message: 'Templates', id: 'home.ecosystem.templates.title' }),
    description: translate({
      message: 'Start faster with theme-starter scaffolds and production-ready site templates.',
      id: 'home.ecosystem.templates.desc',
    }),
    to: '/themes#templates',
    cta: translate({ message: 'Browse templates', id: 'home.ecosystem.templates.cta' }),
    accent: 'templates',
  },
  {
    Icon: IconDesktop,
    title: translate({ message: 'Best practices', id: 'home.ecosystem.guides.title' }),
    description: translate({
      message: 'Guides for SEO, self-hosting, Headless APIs, and shipping modern React sites.',
      id: 'home.ecosystem.guides.desc',
    }),
    to: '/best-practices',
    cta: translate({ message: 'Read guides', id: 'home.ecosystem.guides.cta' }),
    accent: 'guides',
  },
];

export default function Ecosystem() {
  return (
    <section className={styles.section} aria-labelledby="home-ecosystem-heading">
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          <Translate id="home.ecosystem.eyebrow">Ecosystem</Translate>
        </p>
        <h2 id="home-ecosystem-heading" className={styles.heading}>
          <Translate id="home.ecosystem.title">Themes, plugins, and guides — one hub</Translate>
        </h2>
        <p className={styles.subheading}>
          <Translate id="home.ecosystem.subtitle">
            ReactPress.cc is the entry point for the whole platform: core CMS today, extensions and best practices
            growing with you.
          </Translate>
        </p>
      </header>
      <div className={styles.grid}>
        {items.map((item, index) => (
          <Link
            key={item.to}
            className={styles.card}
            to={item.to}
            data-accent={item.accent}
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <span className={styles.iconWrap} aria-hidden>
              <item.Icon className={styles.icon} />
            </span>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardDesc}>{item.description}</p>
            <span className={styles.cta}>{item.cta}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
