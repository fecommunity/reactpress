import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CliCommandBlock from '@site/src/components/CliCommandBlock';
import Devices from '@site/src/components/Home/Hero/Devices';
import FloorBackground from '@site/src/components/Home/Hero/FloorBackground';
import GridBackground from '@site/src/components/Home/Hero/GridBackground';
import Logo from '@site/src/components/Home/Logo';
import React from 'react';
import GitHubButton from 'react-github-btn';

import styles from './styles.module.css';

function Hero() {
  const { siteConfig } = useDocusaurusContext();

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
            <span className={styles.badge}>4.0</span>
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
          <p className={styles.subtitle}>
            <Translate id="home.hero.subTitle">
              WordPress-style editing · Next.js delivery · one CLI — CMS, Admin, API, themes, plugins, and desktop, no assembly required.
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
