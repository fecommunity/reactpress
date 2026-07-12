import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CliCommandBlock from '@site/src/components/CliCommandBlock';
import Devices from '@site/src/components/Home/Hero/Devices';
import FloorBackground from '@site/src/components/Home/Hero/FloorBackground';
import GridBackground from '@site/src/components/Home/Hero/GridBackground';
import Logo from '@site/src/components/Home/Logo';
import {
  buildNpmVersionPageUrl,
} from '@site/src/npm/packageVersions';
import { useReactPressVersions } from '@site/src/npm/useReactPressVersions';
import clsx from 'clsx';
import React from 'react';
import GitHubButton from 'react-github-btn';

import styles from './styles.module.css';

function Hero() {
  const { siteConfig } = useDocusaurusContext();
  const { latest, beta } = useReactPressVersions();

  return (
    <header className={styles.container}>
      <div className={styles.mesh} aria-hidden>
        <span className={styles.orb1} />
        <span className={styles.orb2} />
        <span className={styles.orb3} />
      </div>

      <div className={styles.scene} aria-hidden>
        <div className={styles.gridBackground}>
          <GridBackground />
        </div>
        <div className={styles.devices}>
          <Devices />
        </div>
        <div className={styles.floorBackground}>
          <FloorBackground />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.intro}>
          <Logo className={styles.logo} />
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{siteConfig.title}</h1>
            <div className={styles.versionTags} aria-label="npm package versions">
              <a
                className={clsx(styles.versionTag, styles.versionTagBeta)}
                href={buildNpmVersionPageUrl(beta)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.tagLabel}>
                  <Translate id="home.hero.version.tag.beta">beta</Translate>
                </span>
                <span className={styles.tagValue}>{beta}</span>
              </a>
              <a
                className={clsx(styles.versionTag, styles.versionTagLatest)}
                href={buildNpmVersionPageUrl(latest)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.tagLabel}>
                  <Translate id="home.hero.version.tag.latest">latest</Translate>
                </span>
                <span className={styles.tagValue}>{latest}</span>
              </a>
            </div>
            <span className={styles.githubWrap}>
              <GitHubButton
                href="https://github.com/fecommunity/reactpress"
                data-size="large"
                data-show-count="true"
                aria-label="Star fecommunity/reactpress on GitHub"
              >
                Star
              </GitHubButton>
            </span>
          </div>
          <p className={styles.slogan}>
            <Translate id="theme.tagline">
              Open-source React publishing platform. One CLI, live in ~60 seconds.
            </Translate>
          </p>

          <div className={styles.actions}>
            <div className={styles.buttonContainer}>
              <Link className={styles.primaryButton} to="/docs/intro">
                <Translate id="home.hero.intro">Get Started</Translate>
              </Link>
              <Link className={styles.secondaryButton} to="/docs/tutorial-extras/reactpress-4-0">
                <Translate id="home.hero.whatsNew">What&apos;s New in 4.0</Translate>
              </Link>
              <a
                href="https://blog.gaoredu.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ghostButton}
              >
                <Translate id="home.hero.try">Live Demo</Translate>
              </a>
            </div>

            <div className={styles.cliWrap}>
              <CliCommandBlock variant="hero" showHint={false} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Hero;
