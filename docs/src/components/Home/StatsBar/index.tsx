import { translate } from '@docusaurus/Translate';
import Translate from '@docusaurus/Translate';
import { IconApi, IconClock, IconCode, IconLayers } from '@site/src/components/Home/icons';
import React from 'react';

import styles from './styles.module.css';

type StatItem = {
  Icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  accent: 'cyan' | 'purple' | 'teal' | 'blue';
};

const stats: StatItem[] = [
  {
    Icon: IconClock,
    value: translate({ message: '~60s', id: 'home.stats.setup.value' }),
    label: translate({ message: 'First deploy', id: 'home.stats.setup.label' }),
    accent: 'cyan',
  },
  {
    Icon: IconCode,
    value: translate({ message: 'Next.js', id: 'home.stats.themes.value' }),
    label: translate({ message: 'SSR themes', id: 'home.stats.themes.label' }),
    accent: 'purple',
  },
  {
    Icon: IconApi,
    value: translate({ message: 'REST', id: 'home.stats.api.value' }),
    label: translate({ message: 'Headless API', id: 'home.stats.api.label' }),
    accent: 'teal',
  },
  {
    Icon: IconLayers,
    value: translate({ message: 'Hook', id: 'home.stats.plugins.value' }),
    label: translate({ message: 'Plugin system', id: 'home.stats.plugins.label' }),
    accent: 'blue',
  },
];

export default function StatsBar() {
  return (
    <section className={styles.bar} aria-label={translate({ message: 'Platform at a glance', id: 'home.stats.aria' })}>
      <div className={styles.inner}>
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={styles.item}
            data-accent={stat.accent}
            style={{ animationDelay: `${index * 0.07}s` }}
          >
            <span className={styles.iconWrap} aria-hidden>
              <stat.Icon className={styles.icon} />
            </span>
            <div className={styles.text}>
              <span className={styles.value}>{stat.value}</span>
              <span className={styles.label}>{stat.label}</span>
            </div>
          </div>
        ))}
        <p className={styles.tagline}>
          <Translate id="home.stats.tagline">
            WordPress familiarity. React-native delivery. No duct tape.
          </Translate>
        </p>
      </div>
    </section>
  );
}
