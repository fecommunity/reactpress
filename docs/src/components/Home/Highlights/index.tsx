import { translate } from '@docusaurus/Translate';
import Translate from '@docusaurus/Translate';
import {
  IconDesktop,
  IconLayers,
  IconPlugins,
  IconRocket,
  IconTerminal,
  IconThemes,
} from '@site/src/components/Home/icons';
import React from 'react';

import styles from './styles.module.css';

type HighlightItem = {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent: 'purple' | 'cyan' | 'teal';
};

const items: HighlightItem[] = [
  {
    Icon: IconPlugins,
    title: translate({ message: 'Plugin ecosystem', id: 'home.highlight.plugins.title' }),
    description: translate({
      message:
        'WordPress-grade extensibility — Hook system, plugin.json manifest, and admin slots. SEO and auto-summary ship built-in.',
      id: 'home.highlight.plugins.desc',
    }),
    accent: 'purple',
  },
  {
    Icon: IconDesktop,
    title: translate({ message: 'Desktop client', id: 'home.highlight.desktop.title' }),
    description: translate({
      message:
        'Write offline, sync when ready — Electron shell with SQLite local mode and seamless remote publishing.',
      id: 'home.highlight.desktop.desc',
    }),
    accent: 'cyan',
  },
  {
    Icon: IconThemes,
    title: translate({ message: 'npm theme catalog', id: 'home.highlight.themes.title' }),
    description: translate({
      message:
        'Install production themes from npm — official catalog, theme-starter scaffold, and hello-world template.',
      id: 'home.highlight.themes.desc',
    }),
    accent: 'teal',
  },
  {
    Icon: IconRocket,
    title: translate({ message: 'Zero-config setup', id: 'home.highlight.zero.title' }),
    description: translate({
      message:
        'Two commands, one minute — auto-generated config, .env, and Docker MySQL. No manual environment wiring.',
      id: 'home.highlight.zero.desc',
    }),
    accent: 'purple',
  },
  {
    Icon: IconTerminal,
    title: translate({ message: 'One command line tool', id: 'home.highlight.cli.title' }),
    description: translate({
      message:
        'init, dev, status, self-check — the entire lifecycle from a single global install in your terminal.',
      id: 'home.highlight.cli.desc',
    }),
    accent: 'cyan',
  },
  {
    Icon: IconLayers,
    title: translate({ message: 'Full-stack in one box', id: 'home.highlight.dx.title' }),
    description: translate({
      message:
        'CMS, admin, API, themes, plugins, and desktop — no stitching together five repos to ship content.',
      id: 'home.highlight.dx.desc',
    }),
    accent: 'teal',
  },
];

export default function Highlights() {
  return (
    <section className={styles.section} aria-labelledby="home-highlights-heading">
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          <Translate id="home.highlights.eyebrow">ReactPress 4.0</Translate>
        </p>
        <h2 id="home-highlights-heading" className={styles.heading}>
          <Translate id="home.highlights.title">Built different. Shipped whole.</Translate>
        </h2>
        <p className={styles.subheading}>
          <Translate id="home.highlights.subtitle">
            Everything WordPress taught the web — rebuilt on React, delivered as one platform.
          </Translate>
        </p>
      </header>
      <div className={styles.grid}>
        {items.map((item, index) => (
          <article
            key={item.title}
            className={styles.card}
            data-accent={item.accent}
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <span className={styles.iconWrap} aria-hidden>
              <item.Icon className={styles.icon} />
            </span>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardDesc}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
