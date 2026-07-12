import { translate } from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import type { ReactNode } from 'react';

import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
  accent: 1 | 2 | 3;
};

const FeatureList: FeatureItem[] = [
  {
    title: translate({ message: 'Zero-config setup', id: 'home.feature.zero.title' }),
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: translate({
      message:
        'Installer-style wizard configures your site and database automatically — as familiar as setting up WordPress, as fast as running two commands.',
      id: 'home.feature.zero.desc',
    }),
    accent: 1,
  },
  {
    title: translate({ message: 'All-in-one CLI', id: 'home.feature.cli.title' }),
    Svg: require('@site/static/img/undraw_version_control.svg').default,
    description: translate({
      message:
        'One binary for init, dev, status, and self-check — interactive menus and live URLs the moment your stack is up.',
      id: 'home.feature.cli.desc',
    }),
    accent: 2,
  },
  {
    title: translate({ message: 'Modern interface', id: 'home.feature.ui.title' }),
    Svg: require('@site/static/img/undraw_react.svg').default,
    description: translate({
      message: 'Polished admin and public site with light/dark themes — built for daily editorial work.',
      id: 'home.feature.ui.desc',
    }),
    accent: 3,
  },
  {
    title: translate({ message: 'Content & authoring', id: 'home.feature.content.title' }),
    Svg: require('@site/static/img/undraw_typewriter.svg').default,
    description: translate({
      message:
        'Markdown-native editor with articles, taxonomies, pages, comments, and media — everything writers and editors expect.',
      id: 'home.feature.content.desc',
    }),
    accent: 1,
  },
  {
    title: translate({ message: 'Open integrations', id: 'home.feature.headless.title' }),
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: translate({
      message: 'REST APIs, access keys, and webhooks — wire ReactPress into your CI, mobile apps, or data pipeline.',
      id: 'home.feature.headless.desc',
    }),
    accent: 2,
  },
  {
    title: translate({ message: 'Internationalization', id: 'home.feature.i18n.title' }),
    Svg: require('@site/static/img/undraw_around_the_world.svg').default,
    description: translate({
      message: 'Bilingual UI out of the box — responsive layouts that feel native on desktop, tablet, and phone.',
      id: 'home.feature.i18n.desc',
    }),
    accent: 3,
  },
];

function Feature({ title, Svg, description, accent }: FeatureItem) {
  return (
    <div className={clsx('col col--4', styles.featureCol)}>
      <article className={clsx(styles.featureCard, styles[`accent${accent}`])}>
        <div className={styles.featureIcon}>
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <Heading as="h3" className={styles.featureTitle}>
          {title}
        </Heading>
        <p className={styles.featureDesc}>{description}</p>
      </article>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
