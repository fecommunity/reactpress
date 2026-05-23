import React from 'react';
import { translate } from '@docusaurus/Translate';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

type HighlightItem = {
  icon: string;
  title: string;
  description: string;
};

const items: HighlightItem[] = [
  {
    icon: '⚡',
    title: translate({ message: 'Zero-config setup', id: 'home.highlight.zero.title' }),
    description: translate({
      message: 'Two commands set up your site and database — no manual environment configuration.',
      id: 'home.highlight.zero.desc',
    }),
  },
  {
    icon: '📦',
    title: translate({ message: 'One command line tool', id: 'home.highlight.cli.title' }),
    description: translate({
      message: 'After a global install, initialize, develop, self-check, and view status from the terminal.',
      id: 'home.highlight.cli.desc',
    }),
  },
  {
    icon: '🩺',
    title: translate({ message: 'Easy to get started', id: 'home.highlight.dx.title' }),
    description: translate({
      message: 'Interactive guides, environment checks, and status tips — open your site and admin right after startup.',
      id: 'home.highlight.dx.desc',
    }),
  },
];

export default function Highlights() {
  return (
    <section className={styles.section} aria-labelledby="home-highlights-heading">
      <header className={styles.header}>
        <h2 id="home-highlights-heading" className={styles.heading}>
          <Translate id="home.highlights.title">3.0 highlights</Translate>
        </h2>
      </header>
      <div className={styles.grid}>
        {items.map((item, index) => (
          <article
            key={item.title}
            className={styles.card}
            style={{ animationDelay: `${index * 0.08}s` }}>
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
