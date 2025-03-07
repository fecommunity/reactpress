/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import Logo from '@site/src/pages/Home/Logo';

import GridBackground from '@site/src/pages/Home/Hero/GridBackground';
import FloorBackground from '@site/src/pages/Home/Hero/FloorBackground';
import Devices from '@site/src/pages/Home/Hero/Devices';
import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Translate from '@docusaurus/Translate';

function Hero() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <div className={styles.container}>
      <div className={styles.backgroundContainer}>
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
        <Logo className={styles.logo} />
        <h1 className={styles.title}>{siteConfig.title}</h1>
        <h2 className={styles.subtitle}>
          <Translate id="home.hero.subTitle">一个基于Next.js的博客&CMS系统。</Translate>
        </h2>
        <div className={styles.buttonContainer}>
          <a href="/docs/intro" className={styles.primaryButton}>
            <Translate id="home.hero.intro">入门指南</Translate>
          </a>
          <a href="https://blog.gaoredu.com" target="_blank" className={styles.secondaryButton}>
            <Translate id="home.hero.try">试用一下</Translate>
          </a>
          <a href="https://github.com/fecommunity/reactpress" target="_blank" className={styles.githubButton}>
            <img src="https://img.shields.io/github/stars/fecommunity/reactpress?color=green&style=social" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Hero;
