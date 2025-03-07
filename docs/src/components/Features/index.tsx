import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Translate, { translate } from '@docusaurus/Translate';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: translate({
      message: '组件化',
    }),
    Svg: require('@site/static/img/undraw_react.svg').default,
    description: translate({
      message: '基于 AntDesign 组件库 v5 最新版的交互语言和视觉风格。',
    }),
  },
  {
    title: translate({
      message: '国际化',
    }),
    Svg: require('@site/static/img/undraw_around_the_world.svg').default,
    description: translate({
      message: '支持中英文切换，国际化配置管理能力。',
    }),
  },
  {
    title: translate({
      message: '黑白主题',
    }),
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: translate({
      message: '支持亮色和暗黑模式主题自由切换。',
    }),
  },
  {
    title: translate({
      message: '创作管理',
    }),
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: translate({
      message: '内置 MarkDown 编辑器，支持文章写文章、分类目录管理，标签管理。',
    }),
  },
  {
    title: translate({
      message: '内容管理',
    }),
    Svg: require('@site/static/img/undraw_version_control.svg').default,
    description: translate({
      message: '支持自定义新页面、内容评论管理，完整的社区互动功能。',
    }),
  },
  {
    title: translate({
      message: '多端适配',
    }),
    Svg: require('@site/static/img/undraw_typewriter.svg').default,
    description: translate({
      message: '完美适配电脑、平板、移动端H5页面。',
    }),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
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
