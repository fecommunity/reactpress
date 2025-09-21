// scripts/generate-api.js
const { generateApi } = require('swagger-typescript-api');
const path = require('path');
const fs = require('fs-extra');

// 配置常量
const CONFIG = {
  input: path.resolve(__dirname, '../../server/public/swagger.json'),
  output: path.resolve(__dirname, '../src'),
  templates: path.resolve(__dirname, '../node_modules/swagger-typescript-api/templates/modular'),
  httpClientType: 'axios',
  typePrefix: 'I',
  generateResponses: true,
  generateRouteTypes: false,
  extractRequestParams: true,
  extractRequestBody: true,
  unwrapResponseData: false,
  defaultResponseType: 'void',
  singleHttpClient: true,
  cleanOutput: true,
  enumNamesAsValues: false,
  moduleNameFirstTag: false,
  generateUnionEnums: false,
  moduleNameIndex: 1,
};

// 生成 API 类型定义和客户端
async function generateApiTypes() {
  console.log('🚀 开始生成 TypeScript API 定义...');
  console.log(`📁 输入: ${CONFIG.input}`);
  console.log(`📁 输出: ${CONFIG.output}`);

  // 检查输入文件是否存在
  if (!fs.existsSync(CONFIG.input)) {
    console.error(`❌ Swagger JSON 文件不存在: ${CONFIG.input}`);
    process.exit(1);
  }

  try {
    // 确保输出目录存在
    fs.ensureDirSync(CONFIG.output);

    const result = await generateApi({
      input: CONFIG.input,
      output: CONFIG.output,
      modular: true,
      cleanOutput: CONFIG.cleanOutput,
      templates: CONFIG.templates,
      httpClientType: CONFIG.httpClientType,
      typePrefix: CONFIG.typePrefix,
      generateResponses: CONFIG.generateResponses,
      generateRouteTypes: CONFIG.generateRouteTypes,
      extractRequestParams: CONFIG.extractRequestParams,
      extractRequestBody: CONFIG.extractRequestBody,
      unwrapResponseData: CONFIG.unwrapResponseData,
      defaultResponseType: CONFIG.defaultResponseType,
      singleHttpClient: CONFIG.singleHttpClient,
      enumNamesAsValues: CONFIG.enumNamesAsValues,
      moduleNameFirstTag: CONFIG.moduleNameFirstTag,
      generateUnionEnums: CONFIG.generateUnionEnums,
      moduleNameIndex: CONFIG.moduleNameIndex,
    });

    console.log('✅ TypeScript API 定义生成成功!');

    // 检查生成的文件
    const files = fs.readdirSync(CONFIG.output);
    console.log('📄 生成的文件:', files);

    // 后处理：组织文件和创建索引
    await organizeGeneratedFiles();

    return result;
  } catch (error) {
    console.error('❌ 生成 API 类型定义时出错:', error.message);
    process.exit(1);
  }
}

// 组织生成的文件到正确的文件夹结构
async function organizeGeneratedFiles() {
  const srcDir = CONFIG.output;

  // 检查生成的文件
  const files = fs.readdirSync(srcDir);

  // 创建必要的目录
  const apiDir = path.join(srcDir, 'api');
  const typesDir = path.join(srcDir, 'types');
  const utilsDir = path.join(srcDir, 'utils');

  fs.ensureDirSync(apiDir);
  fs.ensureDirSync(typesDir);
  fs.ensureDirSync(utilsDir);

  // 移动文件到正确的目录
  files.forEach((file) => {
    const filePath = path.join(srcDir, file);

    if (file.endsWith('.ts')) {
      // 根据文件名判断文件类型
      if (file === 'http-client.ts' || file === 'api-client.ts' || /[A-Z]/.test(file[0])) {
        // API 文件：首字母大写的文件或特定的客户端文件
        fs.moveSync(filePath, path.join(apiDir, file), { overwrite: true });
        console.log(`📄 移动 API 文件: ${file} -> api/`);
      } else if (file.includes('contract') || file === 'types.ts') {
        // 类型定义文件
        fs.moveSync(filePath, path.join(typesDir, file === 'types.ts' ? 'index.ts' : file), { overwrite: true });
        console.log(`📄 移动类型文件: ${file} -> types/`);
      } else {
        // 其他文件留在根目录
        console.log(`📄 保留文件: ${file}`);
      }
    }
  });

  // 创建索引文件
  await createIndexFiles();

  console.log('✅ 文件组织完成');
}

// 创建索引文件
async function createIndexFiles() {
  const srcDir = CONFIG.output;
  const apiDir = path.join(srcDir, 'api');
  const typesDir = path.join(srcDir, 'types');

  // 1. 创建 API 索引文件
  const apiFiles = fs.readdirSync(apiDir).filter((file) => file.endsWith('.ts') && file !== 'index.ts');
  let apiIndexContent = '// API 客户端索引\n// 自动生成，请勿手动修改\n\n';

  apiFiles.forEach((file) => {
    const moduleName = file.replace('.ts', '');
    apiIndexContent += `export * from './${moduleName}';\n`;
  });

  // 添加默认导出（如果有 API 客户端）
  if (apiFiles.includes('http-client.ts') || apiFiles.includes('api-client.ts')) {
    const clientFile = apiFiles.find((f) => f.includes('client'));
    const clientName = clientFile ? clientFile.replace('.ts', '') : 'Api';
    apiIndexContent += `\nexport { default as ${clientName} } from './${clientName}';\n`;
  }

  fs.writeFileSync(path.join(apiDir, 'index.ts'), apiIndexContent);
  console.log('📄 创建 API 索引文件');

  // 2. 创建类型索引文件
  const typeFiles = fs.readdirSync(typesDir).filter((file) => file.endsWith('.ts') && file !== 'index.ts');
  let typeIndexContent = '// 类型定义索引\n// 自动生成，请勿手动修改\n\n';

  typeFiles.forEach((file) => {
    const moduleName = file.replace('.ts', '');
    typeIndexContent += `export * from './${moduleName}';\n`;
  });

  fs.writeFileSync(path.join(typesDir, 'index.ts'), typeIndexContent);
  console.log('📄 创建类型索引文件');

  // 3. 创建主索引文件
  const mainIndexContent = `// Auto-generated API client
// Generated from Swagger/OpenAPI specification

export * from './api';
export * from './types';
export * from './utils';
`;

  fs.writeFileSync(path.join(srcDir, 'index.ts'), mainIndexContent);
  console.log('📄 创建主索引文件');

  // 4. 生成工具函数
  await generateUtils();
}

// 生成工具函数
async function generateUtils() {
  const utilsDir = path.join(CONFIG.output, 'utils');
  fs.ensureDirSync(utilsDir);

  // HTTP 客户端配置
  const httpUtilsContent = `import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// 创建自定义 axios 实例
export const createHttpClient = (baseURL?: string) => {
  const instance = axios.create({
    baseURL: baseURL || process.env.API_BASE_URL || 'http://localhost:3002',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      // 添加认证令牌
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = \`Bearer \${token}\`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response.data;
    },
    (error) => {
      // 统一错误处理
      if (error.response?.status === 401) {
        // 未授权处理
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response?.data || error);
    }
  );

  return instance;
};

// 默认 HTTP 客户端实例
export const httpClient = createHttpClient();

export default httpClient;
`;

  // 通用工具函数
  const commonUtilsContent = `// 通用工具函数

// 日期格式化
export const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
};

// 深度克隆
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
};

// API 响应处理
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 分页响应
export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 错误处理
export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
`;

  // 工具索引文件
  const utilsIndexContent = `// 工具函数索引
// 自动生成，请勿手动修改

export * from './http';
export * from './common';
`;

  // 写入工具文件
  fs.writeFileSync(path.join(utilsDir, 'http.ts'), httpUtilsContent);
  fs.writeFileSync(path.join(utilsDir, 'common.ts'), commonUtilsContent);
  fs.writeFileSync(path.join(utilsDir, 'index.ts'), utilsIndexContent);

  console.log('📄 工具函数生成完成');
}

// 执行生成
generateApiTypes()
  .then(() => {
    console.log('🎉 API 生成过程完成!');
    console.log('📁 生成的文件结构:');
    console.log('  - src/api/        # API 客户端');
    console.log('  - src/types/      # 类型定义');
    console.log('  - src/utils/      # 工具函数');
    console.log('  - src/index.ts    # 主入口文件');
  })
  .then(() => {
    // 运行修复脚本
    const { exec } = require('child_process');
    exec('node scripts/organize-api.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 修复脚本执行失败:', error);
        return;
      }
      console.log(stdout);
      console.log('📁 最终文件结构:');
      console.log('  - src/api/        # API 客户端');
      console.log('  - src/types/      # 类型定义');
      console.log('  - src/utils/      # 工具函数');
      console.log('  - src/index.ts    # 主入口文件');
    });
  })
  .catch((error) => {
    console.error('❌ API 生成过程失败:', error.message);
    process.exit(1);
  });
