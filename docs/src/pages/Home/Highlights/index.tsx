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
      message: '两条命令自动完成安装与数据库准备，无需手工配置环境。',
      id: 'home.highlight.zero.desc',
    }),
  },
  {
    icon: '📦',
    title: translate({ message: '一条命令搞定', id: 'home.highlight.cli.title' }),
    description: translate({
      message: '全局安装后，初始化、开发、自检与状态查看都在命令行里完成。',
      id: 'home.highlight.cli.desc',
    }),
  },
  {
    icon: '🩺',
    title: translate({ message: '上手更省心', id: 'home.highlight.dx.title' }),
    description: translate({
      message: '交互式引导、环境自检与运行状态提示，启动成功即可打开前台与后台。',
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
