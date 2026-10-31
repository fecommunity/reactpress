import { translate } from '@docusaurus/Translate';
import Translate from '@docusaurus/Translate';
import { IconCode, IconLayers, IconPlugins } from '@site/src/components/Home/icons';
import React from 'react';

import styles from './styles.module.css';

type Pillar = {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent: 'build' | 'manage' | 'extend';
};

const pillars: Pillar[] = [
  {
    Icon: IconCode,
    title: translate({ message: 'Build', id: 'home.platform.build.title' }),
    description: translate({
      message: 'Create modern websites with React and a developer-first workflow.',
      id: 'home.platform.build.desc',
    }),
    accent: 'build',
  },
  {
    Icon: IconLayers,
    title: translate({ message: 'Manage', id: 'home.platform.manage.title' }),
    description: translate({
      message: 'Manage content and websites through a unified CMS.',
      id: 'home.platform.manage.desc',
    }),
    accent: 'manage',
  },
  {
    Icon: IconPlugins,
    title: translate({ message: 'Extend', id: 'home.platform.extend.title' }),
    description: translate({
      message: 'Customize and expand with plugins, themes, templates, and components.',
      id: 'home.platform.extend.desc',
    }),
    accent: 'extend',
  },
];

export default function Platform() {
  return (
    <section className={styles.section} aria-labelledby="home-platform-heading">
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          <Translate id="home.platform.eyebrow">ReactPress Platform</Translate>
        </p>
        <h2 id="home-platform-heading" className={styles.heading}>
          <Translate id="home.platform.title">Build. Manage. Extend.</Translate>
        </h2>
        <p className={styles.subheading}>
          <Translate id="home.platform.subtitle">
            An open-source platform that brings website creation, content management, and extensibility together for
            modern web developers.
          </Translate>
        </p>
      </header>
      <div className={styles.grid}>
        {pillars.map((pillar, index) => (
          <article
            key={pillar.title}
            className={styles.card}
            data-accent={pillar.accent}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <span className={styles.step} aria-hidden>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className={styles.iconWrap} aria-hidden>
              <pillar.Icon className={styles.icon} />
            </span>
            <h3 className={styles.cardTitle}>{pillar.title}</h3>
            <p className={styles.cardDesc}>{pillar.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
