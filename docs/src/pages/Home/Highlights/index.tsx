import React from 'react';
import { translate } from '@docusaurus/Translate';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

type HighlightItem = {
  icon: string;
  title: string;
  description: string;
};

const items: HighlightItem[] = [
  {
    icon: '⚡',
    title: translate({ message: '零配置起站', id: 'home.highlight.zero.title' }),
    description: translate({
      message: 'init + dev 自动生成配置与 .env，默认 Docker MySQL，无需手写环境变量。',
      id: 'home.highlight.zero.desc',
    }),
  },
  {
    icon: '📦',
    title: translate({ message: '唯一 CLI 入口', id: 'home.highlight.cli.title' }),
    description: translate({
      message: '全局安装 @fecommunity/reactpress@3，init / dev / doctor / status 一条命令搞定。',
      id: 'home.highlight.cli.desc',
    }),
  },
  {
    icon: '🩺',
    title: translate({ message: '可诊断的开发体验', id: 'home.highlight.dx.title' }),
    description: translate({
      message: '交互式菜单、doctor 自检、status 状态与 dev 成功后的直达链接提示。',
      id: 'home.highlight.dx.desc',
    }),
  },
];

export default function Highlights() {
  return (
    <section className={styles.section} aria-labelledby="home-highlights-heading">
      <header className={styles.header}>
        <h2 id="home-highlights-heading" className={styles.heading}>
          <Translate id="home.highlights.title">3.0 核心亮点</Translate>
        </h2>
      </header>
      <div className={styles.grid}>
        {items.map((item, index) => (
          <article
            key={item.title}
            className={styles.card}
            style={{ animationDelay: `${index * 0.08}s` }}>
            <span className={styles.icon} aria-hidden>
              {item.icon}
            </span>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardDesc}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
