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
    title: translate({ message: '零配置起站', id: 'home.feature.zero.title' }),
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: translate({
      message: 'reactpress init 与 dev 自动生成配置、.env 与嵌入式 MySQL，WordPress 式安装向导。',
      id: 'home.feature.zero.desc',
    }),
    accent: 1,
  },
  {
    title: translate({ message: '统一 CLI', id: 'home.feature.cli.title' }),
    Svg: require('@site/static/img/undraw_version_control.svg').default,
    description: translate({
      message: 'doctor 环境自检、status 运行状态，交互式菜单与 dev 成功后的直达链接。',
      id: 'home.feature.cli.desc',
    }),
    accent: 2,
  },
  {
    title: translate({ message: '组件化 UI', id: 'home.feature.ui.title' }),
    Svg: require('@site/static/img/undraw_react.svg').default,
    description: translate({
      message: '基于 Ant Design 5 的现代化后台与前台，支持亮/暗主题切换。',
      id: 'home.feature.ui.desc',
    }),
    accent: 3,
  },
  {
    title: translate({ message: '创作与内容', id: 'home.feature.content.title' }),
    Svg: require('@site/static/img/undraw_typewriter.svg').default,
    description: translate({
      message: '内置 Markdown 编辑器，文章、分类、标签、页面、评论与媒体（本地上传 / OSS）。',
      id: 'home.feature.content.desc',
    }),
    accent: 1,
  },
  {
    title: translate({ message: 'Headless API', id: 'home.feature.headless.title' }),
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: translate({
      message: 'API Key、Webhook、健康检查与 toolkit SDK，便于对接外部系统与自动化。',
      id: 'home.feature.headless.desc',
    }),
    accent: 2,
  },
  {
    title: translate({ message: '国际化', id: 'home.feature.i18n.title' }),
    Svg: require('@site/static/img/undraw_around_the_world.svg').default,
    description: translate({
      message: '中英文界面切换，SSR 友好，适配桌面、平板与移动端。',
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
