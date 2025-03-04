/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import Features from '@site/src/components/Features';

import styles from './styles.module.css';

function CallToAction() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.background} />
      <div className={styles.container}>
        <h1 className={styles.title}>主要特性</h1>
        <Features />
      </div>
    </div>
  );
}

export default CallToAction;
