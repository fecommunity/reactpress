import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import { translate } from '@docusaurus/Translate';

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
        'Installer-style flow auto-configures your site and database — as familiar as setting up a popular blog platform.',
      id: 'home.feature.zero.desc',
    }),
    accent: 1,
  },
  {
    title: translate({ message: 'All-in-one CLI', id: 'home.feature.cli.title' }),
    Svg: require('@site/static/img/undraw_version_control.svg').default,
    description: translate({
      message:
        'Environment checks, status output, interactive menus, and direct links right after startup.',
      id: 'home.feature.cli.desc',
    }),
    accent: 2,
  },
  {
    title: translate({ message: 'Modern interface', id: 'home.feature.ui.title' }),
    Svg: require('@site/static/img/undraw_react.svg').default,
    description: translate({
      message: 'Modern admin and public site with light/dark theme support.',
      id: 'home.feature.ui.desc',
    }),
    accent: 3,
  },
  {
    title: translate({ message: 'Content & authoring', id: 'home.feature.content.title' }),
    Svg: require('@site/static/img/undraw_typewriter.svg').default,
    description: translate({
      message:
        'Built-in Markdown editor; articles, categories, tags, pages, comments, and media in one place.',
      id: 'home.feature.content.desc',
    }),
    accent: 1,
  },
  {
    title: translate({ message: 'Open integrations', id: 'home.feature.headless.title' }),
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: translate({
      message: 'Open APIs, access keys, and event callbacks for external systems and automation.',
      id: 'home.feature.headless.desc',
    }),
    accent: 2,
  },
  {
    title: translate({ message: 'Internationalization', id: 'home.feature.i18n.title' }),
    Svg: require('@site/static/img/undraw_around_the_world.svg').default,
    description: translate({
      message: 'Chinese/English UI, comfortable on desktop, tablet, and mobile.',
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
