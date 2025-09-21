// src/demo.ts
import { api, types, utils } from '../src';

// 使用类型定义
const exampleUser: types.IUser = {
  name: '张三',
  password: 'hashed_password', // 实际应用中应该是加密后的密码
  avatar: 'https://example.com/avatar.jpg',
  email: 'zhangsan@example.com',
  role: 'user',
  status: 'active',
  type: 'local',
  createAt: new Date().toISOString(),
  updateAt: new Date().toISOString()
};

const exampleArticle: types.IArticle = {
  id: '1',
  title: '示例文章',
  cover: 'https://example.com/cover.jpg',
  summary: '这是一篇示例文章的摘要',
  content: '这是文章的完整内容...',
  html: '<p>这是文章的HTML内容...</p>',
  toc: '[]',
  category: {
    id: '1',
    label: '技术',
    value: 'tech',
    articles: [],
    createAt: new Date().toISOString(),
    updateAt: new Date().toISOString()
  },
  tags: ['typescript', 'api'],
  status: 'published',
  views: 0,
  likes: 0,
  isRecommended: false,
  password: '',
  needPassword: false,
  isCommentable: true,
  publishAt: new Date().toISOString(),
  createAt: new Date().toISOString(),
  updateAt: new Date().toISOString()
};

// API 调用示例
async function demoAPIUsage() {
  try {
    console.log('🚀 开始 API 演示...');

    // 1. 获取所有用户
    console.log('📋 获取用户列表...');
    const users = await api.UserController_findAll();
    console.log('✅ 用户列表:', users);

    // 2. 注册新用户
    console.log('📋 注册新用户...');
    const newUser = await api.UserController_register(exampleUser);
    console.log('✅ 新用户:', newUser);

    // 3. 获取所有文章
    console.log('📋 获取文章列表...');
    const articles = await api.ArticleController_findAll();
    console.log('✅ 文章列表:', articles);

    // 4. 创建新文章
    console.log('📋 创建新文章...');
    const createdArticle = await api.ArticleController_create(exampleArticle);
    console.log('✅ 新文章:', createdArticle);

    // 5. 获取特定文章
    console.log('📋 获取特定文章...');
    const article = await api.ArticleController_findById({ id: '1' });
    console.log('✅ 文章详情:', article);

    // 6. 更新文章浏览量
    console.log('📋 更新文章浏览量...');
    const updatedArticle = await api.ArticleController_updateViewsById({ id: '1' });
    console.log('✅ 更新后的文章:', updatedArticle);

  } catch (error) {
    console.error('❌ API 调用失败:', error);
    
    // 使用工具函数处理错误
    if (error instanceof utils.ApiError) {
      console.error(`错误代码: ${error.code}, 消息: ${error.message}`);
    }
  }
}

// 使用工具函数示例
function demoUtilsUsage() {
  console.log('🛠️ 工具函数演示...');
  
  // 1. 日期格式化
  const formattedDate = utils.formatDate(new Date(), 'YYYY年MM月DD日');
  console.log('✅ 格式化日期:', formattedDate);
  
  // 2. 深度克隆
  const original = { name: '张三', profile: { age: 30 } };
  const cloned = utils.deepClone(original);
  console.log('✅ 深度克隆:', cloned);
  
  // 3. 防抖函数
  const debouncedSearch = utils.debounce((query: string) => {
    console.log('🔍 搜索:', query);
  }, 300);
  
  // 模拟搜索输入
  debouncedSearch('typescript');
  debouncedSearch('typescript api');
  
  // 4. 节流函数
  const throttledScroll = utils.throttle((position: number) => {
    console.log('📜 滚动位置:', position);
  }, 1000);
  
  // 模拟滚动事件
  throttledScroll(100);
  throttledScroll(200);
  throttledScroll(300);
}

// 高级用法示例
async function demoAdvancedUsage() {
  console.log('🎯 高级用法演示...');
  
  try {
    // 1. 使用 HTTP 客户端直接调用 API
    console.log('📋 使用 HTTP 客户端直接调用...');
    const httpClient = await import('@fecommunity/toolkit/utils').then(m => m.httpClient);
    
    const response = await httpClient.get('/api/user');
    console.log('✅ 直接HTTP调用结果:', response);
    
    // 2. 批量操作
    console.log('📋 批量获取数据...');
    const [users, articles, settings] = await Promise.all([
      api.UserController_findAll(),
      api.ArticleController_findAll(),
      api.SettingController_findAll()
    ]);
    
    console.log('✅ 批量获取完成:');
    console.log('  用户数量:', users.length);
    console.log('  文章数量:', articles.length);
    
    // 3. 错误处理策略
    console.log('📋 错误处理演示...');
    try {
      // 模拟一个可能失败的请求
      await api.ArticleController_findById({ id: 'non-existent-id' });
    } catch (error) {
      if (utils.isApiError(error)) {
        console.log('✅ 错误已正确处理:', error.message);
      } else {
        console.log('✅ 其他类型错误:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 高级用法演示失败:', error);
  }
}

// 完整演示
async function runDemo() {
  console.log('🎬 开始 Toolkit 演示\n');
  
  // 演示工具函数
  demoUtilsUsage();
  
  // 演示 API 调用
  await demoAPIUsage();
  
  // 演示高级用法
  await demoAdvancedUsage();
  
  console.log('\n🎉 Toolkit 演示完成!');
}

// 运行演示
runDemo().catch(console.error);