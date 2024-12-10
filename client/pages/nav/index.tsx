import { NextPage } from 'next';

import { AdvanceSearch } from '@/components/AdvanceSearch';
import NavCard from '@/components/NavCard';
import { KnowledgeProvider } from '@/providers/knowledge';
import { GithubOutlined } from '@ant-design/icons';
import style from './index.module.scss';
import { ArticleProvider } from '@/providers/article';
import { CategoryProvider } from '@/providers/category';

interface IHomeProps {
  articles?: IArticle[];
  total?: number;
}

const navConfigs = [
  {
    key: 'hot-site',
    label: '热门网址',
    icon: '<GithubOutlined />', // 注意：这里应使用实际的图标组件或字符串表示，这里仅作为占位符
    children: [
      {
        key: 'baidu',
        label: '百度',
        type: '搜索引擎',
        description: "百度一下，你就知道",
        url: 'https://www.baidu.com',
      },
      {
        key: 'taobao',
        label: '淘宝',
        type: '电商平台',
        description: '全球最大的中文网上购物平台',
        url: 'https://www.taobao.com',
      },
      {
        key: 'tencent',
        label: '腾讯',
        type: '互联网公司',
        description: '连接一切的互联网',
        url: 'https://www.tencent.com',
      },
      {
        key: 'weibo',
        label: '微博',
        type: '社交媒体',
        description: '随时随地发现新鲜事',
        url: 'https://weibo.com',
      },
      {
        key: 'jd',
        label: '京东',
        type: '电商平台',
        description: '多快好省，只为品质生活',
        url: 'https://www.jd.com',
      },
      {
        key: 'sogou',
        label: '搜狗',
        type: '搜索引擎',
        description: '搜狗搜索，知你所想',
        url: 'https://www.sogou.com',
      },
      {
        key: 'iqiyi',
        label: '爱奇艺',
        type: '视频平台',
        description: '高品质视频娱乐服务',
        url: 'https://www.iqiyi.com',
      },
      {
        key: 'douban',
        label: '豆瓣',
        type: '社交书评影评音乐网站',
        description: '我们的精神角落',
        url: 'https://www.douban.com',
      },
      {
        key: 'zhihu',
        label: '知乎',
        type: '问答社区',
        description: '有问题，上知乎',
        url: 'https://www.zhihu.com',
      },
      {
        key: 'today',
        label: '即刻',
        type: '资讯平台',
        description: '你的兴趣引擎',
        url: 'https://www.jinri.today',
      },
    ],
  },
  {
    key: 'front-end-dev',
    label: '前端开发',
    // icon: <CodeOutlined />, // 假设的图标，实际应替换为适合前端开发的图标
    children: [
      {
        key: 'w3schools',
        label: 'W3Schools',
        type: '在线教程',
        description: '全球最大的Web技术教程网站',
        url: 'https://www.w3schools.com',
        // icon: <BookOutlined />, // 书籍图标
      },
      {
        key: 'mdn',
        label: 'MDN Web Docs',
        type: '文档',
        description: 'Mozilla开发者网络文档',
        url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript',
        // icon: <FileTextOutlined />, // 文件图标
      },
      {
        key: 'github',
        label: 'GitHub',
        type: '代码托管平台',
        description: '协作开发平台',
        url: 'https://github.com',
        // icon: <GithubOutlined />, // GitHub图标
      },
      {
        key: 'npm',
        label: 'npm',
        type: '包管理器',
        description: 'JavaScript包管理器',
        url: 'https://www.npmjs.com',
        // icon: <PackageOutlined />, // 包图标
      },
      {
        key: 'stackoverflow',
        label: 'Stack Overflow',
        type: '问答社区',
        description: '程序员问答社区',
        url: 'https://stackoverflow.com',
        // icon: <QuestionCircleOutlined />, // 问答图标
      },
      {
        key: 'vuejs',
        label: 'Vue.js',
        type: '前端框架',
        description: '渐进式JavaScript框架',
        url: 'https://cn.vuejs.org',
        // icon: <ReactOutlined />, // 假设的Vue图标，实际应替换为Vue的图标
      },
      {
        key: 'reactjs',
        label: 'React',
        type: '前端框架',
        description: '用于构建用户界面的JavaScript库',
        url: 'https://reactjs.org',
        // icon: <ReactOutlined />, // React图标
      },
      {
        key: 'angular',
        label: 'Angular',
        type: '前端框架',
        description: 'Google开发的前端框架',
        url: 'https://angular.io',
        // icon: <AngularOutlined />, // 假设的Angular图标，实际应替换为Angular的图标
      },
      {
        key: 'css-tricks',
        label: 'CSS-Tricks',
        type: '教程',
        description: 'CSS和前端技术教程',
        url: 'https://css-tricks.com',
        // icon: <FileCodeOutlined />, // 代码文件图标
      },
      {
        key: 'bootstrap',
        label: 'Bootstrap',
        type: '前端框架',
        description: '用于开发响应式布局、移动设备优先的WEB项目的开源框架',
        url: 'https://getbootstrap.com',
        // icon: <BootstrapOutlined />, // 假设的Bootstrap图标，实际应替换为Bootstrap的图标
      },
    ],
  },
  {
    key: 'online-tools',
    label: '在线工具',
    icon: '<ToolOutlined />', // 注意：这里应使用实际的图标组件或字符串表示，这里仅作为占位符
    children: [
      {
        key: 'postman',
        label: 'Postman',
        type: 'API工具',
        description: '用于测试和开发API的协作平台',
        url: 'https://www.postman.com/',
      },
      {
        key: 'figma',
        label: 'Figma',
        type: '设计工具',
        description: '在线UI/UX设计协作工具',
        url: 'https://www.figma.com/',
      },
      {
        key: 'codepen',
        label: 'CodePen',
        type: '代码编辑器',
        description: '前端代码在线编辑和分享平台',
        url: 'https://codepen.io/',
      },
      {
        key: 'jsonformatter',
        label: 'JSON Formatter',
        type: '格式化工具',
        description: '在线JSON格式化、校验和美化工具',
        url: 'https://jsonformatter.org/json-pretty-print',
      },
    ],
  },
  {
    key: 'resource-download',
    label: '资源下载',
    icon: '<DownloadOutlined />', // 注意：这里应使用实际的图标组件或字符串表示，这里仅作为占位符
    children: [
      {
        key: 'github',
        label: 'GitHub',
        type: '代码托管',
        description: '全球最大的代码托管平台',
        url: 'https://github.com/',
      },
      {
        key: 'npm',
        label: 'npm',
        type: '包管理器',
        description: 'JavaScript的包管理工具',
        url: 'https://www.npmjs.com/',
      },
      {
        key: 'iconfont',
        label: 'Iconfont',
        type: '图标库',
        description: '阿里巴巴矢量图标库',
        url: 'https://www.iconfont.cn/',
      },
      {
        key: 'unsplash',
        label: 'Unsplash',
        type: '图片资源',
        description: '高质量免费图片资源网站',
        url: 'https://unsplash.com/',
      },
    ],
  },
  {
    key: 'video-entertainment',
    label: '视频娱乐',
    icon: '<VideoCameraOutlined />', // 注意：这里应使用实际的图标组件或字符串表示，这里仅作为占位符
    children: [
      {
        key: 'bilibili',
        label: 'Bilibili',
        type: '视频平台',
        description: '年轻人的文化社区',
        url: 'https://www.bilibili.com/',
      },
      {
        key: 'iqiyi',
        label: '爱奇艺',
        type: '视频平台',
        description: '海量高清视频在线观看',
        url: 'https://www.iqiyi.com/',
      },
      {
        key: 'youku',
        label: '优酷',
        type: '视频平台',
        description: '中国领先的在线视频平台',
        url: 'https://www.youku.com/',
      },
      {
        key: 'netflix',
        label: 'Netflix',
        type: '流媒体平台',
        description: '全球领先的流媒体娱乐服务平台',
        url: 'https://www.netflix.com/', // 注意：Netflix在某些地区可能无法访问
      },
    ],
  },
];

const Page: NextPage<IHomeProps> = ({}) => {
  return (
    <div className={style.wrapper}>
      <div className="container">
        <div className={style.search}>
          <AdvanceSearch />
        </div>
        <div className={style.content}>
          <NavCard dataSource={navConfigs} />
        </div>
      </div>
    </div>
  );
};

// 服务端预取数据
Page.getInitialProps = async (ctx) => {
  const { category: categoryValue = 'nav' } = ctx.query;
  const [articles, category] = await Promise.all([
    ArticleProvider.getArticlesByCategory(categoryValue, {
      page: 1,
      pageSize: 1000,
      status: 'publish',
    }),
    CategoryProvider.getCategoryById(categoryValue),
  ]);
  return {
    articles: articles[0],
    total: articles[1],
    category: category,
    needLayoutFooter: true,
  };
};

export default Page;
