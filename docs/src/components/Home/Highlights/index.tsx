import { translate } from '@docusaurus/Translate';
import Translate from '@docusaurus/Translate';
import React from 'react';

import styles from './styles.module.css';

type HighlightItem = {
  icon: string;
  title: string;
  description: string;
};

const items: HighlightItem[] = [
  {
    icon: '🔌',
    title: translate({ message: 'Plugin ecosystem', id: 'home.highlight.plugins.title' }),
    description: translate({
      message:
        'Extend your site like WordPress — Hook + plugin.json + Admin slots; SEO and auto-summary built in.',
      id: 'home.highlight.plugins.desc',
    }),
  },
  {
    icon: '🖥️',
    title: translate({ message: 'Desktop client', id: 'home.highlight.desktop.title' }),
    description: translate({
      message:
        'Write and manage without a browser — Electron shell with SQLite local mode and remote sync.',
      id: 'home.highlight.desktop.desc',
    }),
  },
  {
    icon: '🎨',
    title: translate({ message: 'npm theme catalog', id: 'home.highlight.themes.title' }),
    description: translate({
      message: 'Install official themes from npm — theme-starter catalog and hello-world starter template.',
      id: 'home.highlight.themes.desc',
    }),
  },
];

export default function Highlights() {
  return (
    <section className={styles.section} aria-labelledby="home-highlights-heading">
      <header className={styles.header}>
        <h2 id="home-highlights-heading" className={styles.heading}>
          <Translate id="home.highlights.title">4.0 highlights</Translate>
        </h2>
      </header>
      <div className={styles.grid}>
        {items.map((item, index) => (
          <article key={item.title} className={styles.card} style={{ animationDelay: `${index * 0.08}s` }}>
            <span className={styles.icon} aria-hidden>
              {item.icon}
            </span>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardDesc}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
