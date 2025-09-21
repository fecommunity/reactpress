const path = require('path');
const fs = require('fs-extra');

// 配置常量
const SRC_DIR = path.resolve(__dirname, '../src');
const API_DIR = path.join(SRC_DIR, 'api');
const TYPES_DIR = path.join(SRC_DIR, 'types');
const UTILS_DIR = path.join(SRC_DIR, 'utils');

// 修复 API 文件中的导入路径
async function fixApiImports() {
  console.log('🔧 修复 API 文件中的导入路径...');
  
  // 获取所有 API 文件
  const apiFiles = fs.readdirSync(API_DIR).filter(file => file.endsWith('.ts') && file !== 'index.ts');
  
  for (const file of apiFiles) {
    const filePath = path.join(API_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 修复导入路径
    content = content.replace(
      /from '\.\/data-contracts'/g,
      "from '../types/data-contracts'"
    );
    
    // 修复其他可能的类型导入
    content = content.replace(
      /from '\.\/([^']+)'/g,
      (match, importPath) => {
        // 如果导入路径是类型文件，则重定向到 types 目录
        if (importPath.includes('contract') || importPath === 'types') {
          return `from '../types/${importPath}'`;
        }
        return match;
      }
    );
    
    // 写入修复后的内容
    fs.writeFileSync(filePath, content);
    console.log(`✅ 修复 ${file} 的导入路径`);
  }
  
  console.log('✅ 所有 API 文件的导入路径已修复');
}

// 创建统一的类型索引
async function createTypeIndex() {
  console.log('📝 创建统一的类型索引...');
  
  // 获取所有类型文件
  const typeFiles = fs.readdirSync(TYPES_DIR).filter(file => file.endsWith('.ts') && file !== 'index.ts');
  
  let indexContent = '// 类型定义索引\n// 自动生成，请勿手动修改\n\n';
  
  // 添加所有类型文件的导出
  typeFiles.forEach(file => {
    const moduleName = file.replace('.ts', '');
    indexContent += `export * from './${moduleName}';\n`;
  });
  
  // 写入索引文件
  fs.writeFileSync(path.join(TYPES_DIR, 'index.ts'), indexContent);
  console.log('✅ 类型索引文件已创建');
}

// 创建统一的 API 索引
async function createApiIndex() {
  console.log('📝 创建统一的 API 索引...');
  
  // 获取所有 API 文件
  const apiFiles = fs.readdirSync(API_DIR).filter(file => file.endsWith('.ts') && file !== 'index.ts');
  
  let indexContent = '// API 客户端索引\n// 自动生成，请勿手动修改\n\n';
  
  // 添加所有 API 文件的导出
  apiFiles.forEach(file => {
    const moduleName = file.replace('.ts', '');
    indexContent += `export * from './${moduleName}';\n`;
  });
  
  // 添加默认导出（如果有 API 客户端）
  const clientFiles = apiFiles.filter(file => file.includes('client'));
  if (clientFiles.length > 0) {
    const clientFile = clientFiles[0];
    const clientName = clientFile.replace('.ts', '');
    indexContent += `\nexport { default as ${clientName} } from './${clientName}';\n`;
  }
  
  // 写入索引文件
  fs.writeFileSync(path.join(API_DIR, 'index.ts'), indexContent);
  console.log('✅ API 索引文件已创建');
}

// 创建主入口文件
async function createMainIndex() {
  console.log('📝 创建主入口文件...');
  
  const mainIndexContent = `// Auto-generated API client
// Generated from Swagger/OpenAPI specification

export * from './api';
export * from './types';
export * from './utils';
`;

  fs.writeFileSync(path.join(SRC_DIR, 'index.ts'), mainIndexContent);
  console.log('✅ 主入口文件已创建');
}

// 修复所有文件
async function fixAllFiles() {
  try {
    await fixApiImports();
    await createTypeIndex();
    await createApiIndex();
    await createMainIndex();
    
    console.log('🎉 所有文件修复完成!');
    console.log('📁 修复后的文件结构:');
    console.log('  - src/api/        # API 客户端 (导入路径已修复)');
    console.log('  - src/types/      # 类型定义');
    console.log('  - src/utils/      # 工具函数');
    console.log('  - src/index.ts    # 主入口文件');
  } catch (error) {
    console.error('❌ 文件修复失败:', error.message);
    process.exit(1);
  }
}

// 执行修复
fixAllFiles();