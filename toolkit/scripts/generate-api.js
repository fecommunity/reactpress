const { generateApi } = require('swagger-typescript-api');
const path = require('path');
const fs = require('fs-extra');
const { getSwaggerInputPath } = require('./resolve-swagger-input');

// 配置常量
const CONFIG = {
  input: getSwaggerInputPath(),
  output: path.resolve(__dirname, '../src'),
  templates: path.resolve(__dirname, '../node_modules/swagger-typescript-api/templates/base'),
  utilsDir: path.resolve(__dirname, '../src/utils'),
  typesDir: path.resolve(__dirname, '../src/types'),
  apiDir: path.resolve(__dirname, '../src/api'),
};

// 工具函数：将字符串转换为驼峰命名
function toCamelCase(str) {
  return str.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  }).replace(/^[A-Z]/, (match) => match.toLowerCase());
}

// 工具函数：将字符串转换为帕斯卡命名
function toPascalCase(str) {
  return str.replace(/(^\w|[-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
}

// 工具函数：移除控制器名前缀
function removeControllerPrefix(methodName, controllerName) {
  const prefix = toCamelCase(controllerName) + 'Controller';
  if (methodName.startsWith(prefix)) {
    return methodName.substring(prefix.length);
  }
  return methodName;
}

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
    fs.ensureDirSync(CONFIG.typesDir);
    fs.ensureDirSync(CONFIG.apiDir);

    const result = await generateApi({
      input: CONFIG.input,
      output: CONFIG.output,
      templates: CONFIG.templates,
      cleanOutput: false,
      modular: true,
      httpClientType: 'axios',
      typePrefix: 'I',
      generateClient: true,
      generateResponses: true,
      extractRequestParams: true,
      extractResponseBody: true,
      singleHttpClient: true,
      unwrapResponseData: true,
      hooks: {
        onPrepareConfig: (currentConfiguration) => {
          const config = currentConfiguration.config;
          config.fileNames.httpClient = 'HttpClient';
          return { ...currentConfiguration, config };
        },
        onParseSchema: (originalSchema, parsedSchema) => {
          // 确保所有属性都有类型
          if (parsedSchema.properties) {
            Object.keys(parsedSchema.properties).forEach((prop) => {
              if (!parsedSchema.properties[prop].type) {
                parsedSchema.properties[prop].type = 'any';
              }
            });
          }
          return parsedSchema;
        },
      },
    });

    console.log('✅ TypeScript API 定义生成成功!');

    // 组织生成的文件
    await organizeGeneratedFiles();

    return result;
  } catch (error) {
    console.error('❌ 生成 API 类型定义时出错:', error.message);
    process.exit(1);
  }
}

// 组织生成的文件
async function organizeGeneratedFiles() {
  console.log('📁 开始组织生成的文件...');
  
  // 只删除并重新生成 api 和 types 目录中的文件
  // 删除 types 目录中的文件
  if (fs.existsSync(CONFIG.typesDir)) {
    const typeFiles = fs.readdirSync(CONFIG.typesDir);
    typeFiles.forEach(file => {
      fs.removeSync(path.join(CONFIG.typesDir, file));
    });
  }
  
  // 删除 api 目录中的文件（除了 utils 目录）
  if (fs.existsSync(CONFIG.apiDir)) {
    const apiFiles = fs.readdirSync(CONFIG.apiDir);
    apiFiles.forEach(file => {
      fs.removeSync(path.join(CONFIG.apiDir, file));
    });
  }
  
  // 移动类型定义文件
  if (fs.existsSync(path.join(CONFIG.output, 'data-contracts.ts'))) {
    fs.moveSync(
      path.join(CONFIG.output, 'data-contracts.ts'),
      path.join(CONFIG.typesDir, 'index.ts'),
      { overwrite: true }
    );
  }
  
  // 移动 HttpClient
  if (fs.existsSync(path.join(CONFIG.output, 'HttpClient.ts'))) {
    fs.moveSync(
      path.join(CONFIG.output, 'HttpClient.ts'),
      path.join(CONFIG.apiDir, 'HttpClient.ts'),
      { overwrite: true }
    );
  }
  
  // 处理 API 模块文件
  const files = fs.readdirSync(CONFIG.output);
  const apiFiles = files.filter(file => 
    file.endsWith('.ts') && 
    !['data-contracts.ts', 'HttpClient.ts'].includes(file) &&
    file !== 'index.ts' // 排除 index.ts 文件
  );
  
  // 创建 API 模块索引
  let apiIndexContent = '// Auto-generated API module index\n\n';
  let apiInstanceContent = '// Auto-generated API instance\n\n';
  let apiExports = '';
  let apiInstanceProperties = '';
  
  // 处理每个 API 文件
  for (const file of apiFiles) {
    const moduleName = path.basename(file, '.ts');
    const camelCaseName = toCamelCase(moduleName);
    const pascalCaseName = toPascalCase(moduleName);
    
    // 移动文件到 api 目录
    fs.moveSync(
      path.join(CONFIG.output, file),
      path.join(CONFIG.apiDir, file),
      { overwrite: true }
    );
    
    // 更新导入路径并移除控制器前缀
    let fileContent = fs.readFileSync(path.join(CONFIG.apiDir, file), 'utf8');
    
    // 移除控制器前缀
    const methodRegex = new RegExp(`(${pascalCaseName}\\.prototype\\.)${camelCaseName}Controller`, 'g');
    fileContent = fileContent.replace(methodRegex, `$1`);
    
    // 更新导入路径
    fileContent = fileContent
      .replace(/from '\.\/data-contracts';/g, `from '../types';`)
      .replace(/from '\.\/HttpClient';/g, `from './HttpClient';`);
    
    // 更新方法名，移除控制器前缀
    const methodNameRegex = new RegExp(`(${camelCaseName}Controller)([A-Z][a-zA-Z0-9]*)`, 'g');
    fileContent = fileContent.replace(methodNameRegex, (match, prefix, method) => {
      return method.charAt(0).toLowerCase() + method.slice(1);
    });
    
    fs.writeFileSync(path.join(CONFIG.apiDir, file), fileContent);
    
    // 添加到 API 索引
    apiIndexContent += `export { ${pascalCaseName} } from './${moduleName}';\n`;
    
    // 添加到 API 实例
    apiInstanceContent += `import { ${pascalCaseName} } from './${moduleName}';\n`;
    apiInstanceProperties += `  ${camelCaseName}: new ${pascalCaseName}(http),\n`;
    apiExports += `  ${pascalCaseName},\n`;
  }
  
  // 写入 API 索引文件
  fs.writeFileSync(path.join(CONFIG.apiDir, 'index.ts'), apiIndexContent);
  
  // 创建 API 实例文件
  const apiInstanceFile = `
import { HttpClient } from './HttpClient';
${apiInstanceContent}

// Create default HTTP client
export const http = new HttpClient();

// Create API instance with all modules
export const api = {
${apiInstanceProperties}};

// Create custom API instance function
export function createApiInstance(config: any) {
  const customHttp = new HttpClient(config);
  
  return {
${apiInstanceProperties.replace(/http/g, 'customHttp')}  };
}

// Export default API instance
export default api;
${apiExports ? `\nexport {\n${apiExports}};` : ''}
`;
  fs.writeFileSync(path.join(CONFIG.apiDir, 'instance.ts'), apiInstanceFile);
  
  // 创建主索引文件（只更新 api 和 types 的导出）
  await updateMainIndexFile();
  
  console.log('✅ 文件组织完成!');
}

// 更新主索引文件（保持其他导出不变）
async function updateMainIndexFile() {
  // 读取现有的主索引文件内容
  const mainIndexPath = path.join(CONFIG.output, 'index.ts');
  let mainIndexContent = '';
  
  // 获取当前时间戳
  const now = new Date();
  const generationTime = now.toLocaleString();
  
  // 创建或更新主索引文件以匹配指定的结构
  mainIndexContent = `// Automatically generated API toolkit for ReactPress
// Do not manually modify this file
// Generated at: ${generationTime}

import { http as httpInstance, api, createApiInstance } from './api/instance';
import * as types from './types';
import * as utils from './utils';
import * as config from './config';

const http = {
  ...httpInstance,
  createApiInstance,
};

export { api, types, utils, config, http };
`;
  
  fs.writeFileSync(mainIndexPath, mainIndexContent);
}

// 清理临时文件
async function cleanupTempFiles() {
  console.log('🧹 清理临时文件...');
  
  // 删除不需要的文件
  const filesToRemove = [
    path.join(CONFIG.output, 'data-contracts.ts'),
    path.join(CONFIG.output, 'HttpClient.ts'),
  ];
  
  filesToRemove.forEach(file => {
    if (fs.existsSync(file)) {
      fs.removeSync(file);
    }
  });
  
  // 删除其他生成的API文件（它们已经被移动到api目录）
  const files = fs.readdirSync(CONFIG.output);
  const apiFiles = files.filter(file => 
    file.endsWith('.ts') && 
    !['index.ts'].includes(file)
  );
  
  apiFiles.forEach(file => {
    fs.removeSync(path.join(CONFIG.output, file));
  });
  
  console.log('✅ 清理完成!');
}

// 主执行函数
async function main() {
  try {
    await generateApiTypes();
    await cleanupTempFiles();
    console.log('🎉 ReactPress Toolkit 生成完成!');
  } catch (error) {
    console.error('❌ 生成过程中出错:', error.message);
    process.exit(1);
  }
}

// 执行主函数
main();