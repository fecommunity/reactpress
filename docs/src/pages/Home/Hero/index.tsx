import React from 'react';
import Link from '@docusaurus/Link';
import Logo from '@site/src/pages/Home/Logo';
import GridBackground from '@site/src/pages/Home/Hero/GridBackground';
import FloorBackground from '@site/src/pages/Home/Hero/FloorBackground';
import Devices from '@site/src/pages/Home/Hero/Devices';
import CliCommandBlock from '@site/src/components/CliCommandBlock';
import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Translate from '@docusaurus/Translate';
import GitHubButton from 'react-github-btn';

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
            <span className={styles.badge}>3.0</span>
            <span className={styles.githubWrap}>
              <GitHubButton
                href="https://github.com/fecommunity/reactpress"
                data-size="large"
                data-show-count="true"
                aria-label="Star fecommunity/reactpress on GitHub">
                Star
              </GitHubButton>
            </span>
          </div>
          <p className={styles.subtitle}>
            <Translate id="home.hero.subTitle">
              One package, one minute to your own CMS.
            </Translate>
          </p>

          <div className={styles.actions}>
            <div className={styles.buttonContainer}>
              <Link className={styles.primaryButton} to="/docs/intro">
                <Translate id="home.hero.intro">Get Started</Translate>
              </Link>
              <Link
                className={styles.secondaryButton}
                to="/docs/tutorial-extras/reactpress-3-0">
                <Translate id="home.hero.whatsNew">What&apos;s New in 3.0</Translate>
              </Link>
              <a
                href="https://blog.gaoredu.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ghostButton}>
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
