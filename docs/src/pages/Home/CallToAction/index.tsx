import React from 'react';

import Features from '@site/src/components/Features';
import Translate from '@docusaurus/Translate';
import Link from '@docusaurus/Link';

import styles from './styles.module.css';

function CallToAction() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.background} />
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            <Translate id="home.call.feature">平台能力一览</Translate>
          </h2>
          <p className={styles.subtitle}>
            <Translate id="home.call.subtitle">
              从个人博客到团队内容站，ReactPress 提供开箱即用的发布与治理能力。
            </Translate>
          </p>
        </header>
        <Features />
        <div className={styles.footerCta}>
          <Link className={styles.primaryButton} to="/docs/intro">
            <Translate id="home.call.cta">阅读完整文档</Translate>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CallToAction;
