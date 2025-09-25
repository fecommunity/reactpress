interface NavItem {
  label: string;
  key: string;
  url?: string;
  type?: string;
  description?: string;
  icon?: string;
  title?: string;
  children?: NavItem[];
}

interface NavConfig {
  categories: NavItem[];
  subCategories: Record<string, NavItem[]>;
}

const navConfig: NavConfig = {
  categories: [
    {
      label: '站内',
      key: 'local',
    },
    {
      label: '搜索',
      key: 'search',
    },
    {
      label: '工具',
      key: 'tools',
    },
    {
      label: '社区',
      key: 'community',
    },
    {
      label: '求职',
      key: 'job',
    },
  ],
  subCategories: {
    search: [
      {
        label: '百度',
        key: 'search-baidu',
        url: 'https://www.baidu.com/s?wd=',
      },
      {
        label: 'Bing',
        key: 'search-bing',
        url: 'https://cn.bing.com/search?q=',
      },
      {
        label: 'Google',
        key: 'search-google',
        url: 'https://www.google.com/search?q=',
      },
      {
        label: '搜狗',
        key: 'search-sougou',
        url: 'https://www.sogou.com/web?query=',
      },
    ],
    tools: [
      {
        label: '权重查询',
        key: 'tools-quanzhong',
        url: 'https://rank.chinaz.com/all/',
      },
      {
        label: 'SEO查询',
        key: 'tools-seo',
        url: 'https://seo.chinaz.com/',
      },
      {
        label: '关键词查询',
        key: 'tools-keyword',
        url: 'https://www.5118.com/seo/newrelated/',
      },
    ],
    community: [
      {
        label: 'Github',
        key: 'community-github',
        url: 'https://github.com/search?type=repositories&q=',
      },
      {
        label: '掘金',
        key: 'community-juejin',
        url: 'https://juejin.cn/search?type=0&query=',
      },
      {
        label: '知乎',
        key: 'community-zhihu',
        url: 'https://www.zhihu.com/search?type=content&q=',
      },
      {
        label: '豆瓣',
        key: 'community-douban',
        url: 'https://www.douban.com/search?q=',
      },
    ],
    job: [
      {
        label: 'BOSS直聘',
        key: 'job-boss',
        url: 'https://www.zhipin.com/web/geek/job?query=',
      },
      {
        label: '智联招聘',
        key: 'job-zhilian',
        url: 'https://sou.zhaopin.com/jobs/searchresult.ashx?kw=',
      },
      {
        label: '前程无优',
        key: 'job-51job',
        url: 'https://we.51job.com/pc/search?searchType=2&sortType=0&keyword=',
      },
      {
        label: '拉钩网',
        key: 'job-lagou',
        url: 'https://www.lagou.com/jobs/list_',
      },
      {
        label: '猎聘网',
        key: 'job-liepin',
        url: 'https://www.liepin.com/zhaopin/?key=',
      },
    ],
  },
};

interface UrlCategory {
  key: string;
  label: string;
  icon: string;
  children: NavItem[];
}

const urlConfig: UrlCategory[] = [
  {
    key: 'hot-site',
    label: '热门网址',
    icon: 'GlobalOutlined',
    children: [
      {
        key: 'search_baidu',
        label: '百度',
        type: '搜索引擎',
        description: '全球最大的中文搜索引擎，提供全面的网页搜索、图片搜索、视频搜索等服务。',
        url: 'https://www.baidu.com',
      },
      {
        key: 'social_weibo',
        label: '微博',
        type: '社交媒体',
        description: '中国知名的社交媒体平台，提供短文本、图片、视频等内容的发布与分享。',
        url: 'https://weibo.com',
      },
      {
        key: 'ecommerce_taobao',
        label: '淘宝',
        type: '电商平台',
        description: '中国最大的在线购物平台，提供各类商品的购买服务。',
        url: 'https://www.taobao.com',
      },
      {
        key: 'ecommerce_jd',
        label: '京东',
        type: '电商平台',
        description: '中国知名的电商平台，以自营和第三方商家入驻为主，提供正品保障。',
        url: 'https://www.jd.com',
      },
      {
        key: 'video_iqiyi',
        label: '爱奇艺',
        type: '视频网站',
        description: '中国领先的高清视频网站，提供电影、电视剧、综艺等内容的在线观看。',
        url: 'https://www.iqiyi.com',
      },
      {
        key: 'video_bilibili',
        label: '哔哩哔哩',
        type: '视频网站',
        description: '中国知名的弹幕视频网站，以ACG文化为主，提供视频创作与分享平台。',
        url: 'https://www.bilibili.com',
      },
      {
        key: 'news_sina',
        label: '新浪新闻',
        type: '新闻',
        description: '中国知名的新闻门户网站，提供国内外新闻、财经、体育等资讯。',
        url: 'https://news.sina.com.cn',
      },
      {
        key: 'travel_ctrip',
        label: '携程旅行',
        type: '旅行服务',
        description: '中国领先的在线旅行服务公司，提供机票、酒店、度假等预订服务。',
        url: 'https://www.ctrip.com',
      },
      {
        key: 'music_tencent',
        label: 'QQ音乐',
        type: '音乐服务',
        description: '腾讯旗下的音乐播放平台，提供海量音乐资源、歌单推荐和社交功能。',
        url: 'https://y.qq.com',
      },
      {
        key: 'knowledge_douban',
        label: '豆瓣',
        type: '知识社区',
        description: '中国知名的文化、艺术和书籍评论社区，提供书籍、电影、音乐等内容的评分与评论。',
        url: 'https://www.douban.com',
      },
      {
        key: 'map_baidu_map',
        label: '百度地图',
        type: '地图服务',
        description: '中国领先的在线地图服务，提供导航、定位、周边搜索等功能。',
        url: 'https://map.baidu.com',
      },
      {
        key: 'knowledge_zhihu',
        label: '知乎',
        type: '问答社区',
        description: '中国最大的问答社区，用户可以在此分享知识、经验和见解，并找到问题的答案。',
        url: 'https://www.zhihu.com',
      },
    ],
  },
  {
    key: 'online-tools',
    label: '在线工具',
    icon: 'ToolOutlined',
    children: [
      {
        key: 'code_github',
        label: 'GitHub',
        type: '代码托管平台',
        description: '全球最大的代码托管平台，支持协作开发、版本控制、代码审查等功能。',
        url: 'https://github.com',
      },
      {
        key: 'webmaster_tool',
        label: '站长工具',
        type: '网站管理工具集合',
        description: '提供SEO查询、网站检测、关键词挖掘等多种工具，帮助站长优化网站。',
        url: 'https://tool.chinaz.com',
      },
      {
        key: 'excel_to_json_converter',
        label: 'Excel转换JSON',
        type: '数据转换工具',
        description: '用于将Excel文件转换为JSON格式的在线工具，便于在Web应用程序中使用。',
        icon: 'https://www.convertio.co/favicon.ico', // 假设的图标链接，因为convertio可能支持多种转换，不一定有专门的favicon
        url: 'https://www.convertio.co/zh/excel-json/', // 真实的Excel转JSON工具网址（convertio可能是一个综合转换工具，但支持Excel到JSON的转换）
      },
      {
        key: 'chuangkit',
        label: '创可贴',
        description:
          '在线平面设计工具网站，提供丰富的海报、PPT、新媒体配图等模板素材，适合零基础设计小白和需要经常出设计图的人。',
        url: 'https://www.chuangkit.com',
      },
      {
        key: 'shimo',
        label: '石墨文档',
        description: '远程在线办公/协作文档，支持多终端使用，包括文档、表格和PPT，文件自动保存，可通过链接分享文件。',
        url: 'https://shimo.im',
      },
      {
        key: 'yasuo_pdf',
        label: '压缩啦',
        description: '在线压缩网址，支持PDF、图片和视频压缩，压缩后清晰度高度还原，还支持在线解压。',
        url: 'https://yasuo.xunjiepdf.com',
      },
      {
        key: 'gaoding',
        label: '稿定设计',
        description: '在线平面设计网站，提供丰富设计模板和在线辅助功能，如在线PS、拼图和抠图。',
        url: 'https://www.gaoding.com',
      },
      {
        key: 'cli',
        label: '草料二维码',
        description: '在线二维码生成器网站，支持多种样式，可插入logo增加辨识度。',
        url: 'https://www.cli.im',
      },
      {
        key: 'mubu',
        label: '幕布',
        description: '在线思维概要整理工具网站，支持多终端使用和多种通讯软件分享，大纲笔记与思维导图支持一键转换。',
        url: 'https://www.mubu.com',
      },
      {
        key: 'woodo',
        label: 'Woodo',
        description: '在线专业PPT制作网站，提供大量PPT模板，适合工作总结汇报、营销策划等多种场景。',
        url: 'https://www.woodo.cn',
      },
      {
        key: 'bigjpg',
        label: 'AI人工智能图片放大',
        description:
          '使用最新人工智能深度学习技术——深度卷积神经网络。它会将噪点和锯齿的部分进行补充，实现图片的无损放大，支持最大16倍放大。',
        url: 'https://bigjpg.com',
      },
      {
        key: 'tool-lu',
        label: '程序员的工具箱',
        description: '在线运行代码，时间戳，格式转换，代码着色，APP icon制作，应有尽有。',
        url: 'https://tool.lu',
      },
    ],
  },
  {
    key: 'front-end-dev',
    label: '编程开发',
    icon: 'CodeOutlined',
    children: [
      {
        key: 'github',
        label: '代码托管与协作',
        title: 'GitHub',
        description:
          '面向开源及私有软件项目的托管平台，支持Git版本控制，提供订阅、讨论组、文本渲染、在线文件编辑器等功能。',
        url: 'https://github.com/',
      },
      {
        key: 'stackoverflow',
        label: '技术问答社区',
        title: 'Stack Overflow',
        description: '一个程序员和编程爱好者交流技术、互相帮助的IT技术问答网站。',
        url: 'https://stackoverflow.com/',
      },
      {
        key: 'leetcode',
        label: '编程题库与练习',
        title: 'LeetCode',
        description: '在线编程题库，提供大量编程题目，支持多种编程语言，适合不同水平的程序员进行练习。',
        url: 'https://leetcode.com/',
      },
      {
        key: 'csdn',
        label: 'IT技术社区与资源',
        title: 'CSDN',
        description: '中国专业IT社区，提供IT资讯、技术教程、软件开发、考试认证、IT培训等资源。',
        url: 'https://www.csdn.net/',
      },
      {
        key: 'w3schools',
        label: 'Web技术教程',
        title: 'W3Schools',
        description: '提供Web技术教程的网站，包括HTML、CSS、JavaScript、PHP、SQL等。',
        url: 'https://www.w3schools.com/',
      },
      {
        key: 'codesandbox',
        label: '在线代码编辑器',
        title: 'CodeSandbox',
        description: '在线代码编辑器，支持多种前端技术栈，方便开发者进行代码演示和分享。',
        url: 'https://codesandbox.io/',
      },
      {
        key: 'jsonplaceholder',
        label: '假数据服务',
        title: 'JSONPlaceholder',
        description: '提供假数据的在线服务，用于前端开发和测试，提供多种类型的假数据接口。',
        url: 'https://jsonplaceholder.typicode.com/',
      },
      {
        key: 'nodejs-org',
        label: 'Node.js官方网站',
        title: 'Node.js',
        description: 'Node.js的官方网站，提供了Node.js的下载、文档、社区和生态系统信息。',
        url: 'https://nodejs.org/',
      },
      {
        key: 'reactjs-org',
        label: 'React官方网站',
        title: 'React',
        description: 'React的官方网站，提供了React的文档、教程、社区和生态系统资源。',
        url: 'https://reactjs.org/',
      },
    ],
  },
];

const zh = {
  globalConfig: {
    navConfig,
    urlConfig,
  },
};

interface GlobalConfig {
  navConfig: NavConfig;
  urlConfig: UrlCategory[];
}

interface LanguageConfig {
  globalConfig: GlobalConfig;
}

// TODO: 需要为英文环境创建专门的配置
// 当前英文配置只是复制了中文配置，需要根据实际需求调整
const en: LanguageConfig = {
  globalConfig: {
    navConfig,
    urlConfig,
  },
};

interface GlobalSetting {
  zh: LanguageConfig;
  en: LanguageConfig;
}

const globalSetting: GlobalSetting = {
  zh,
  en,
};

export type { GlobalSetting, LanguageConfig, GlobalConfig, NavConfig, NavItem, UrlCategory };
export { globalSetting };