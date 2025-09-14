import * as fs from 'fs-extra';
import * as path from 'path';
import * as dotenv from 'dotenv';

const isProd = process.env.NODE_ENV === 'production';

interface EnvConfig {
  file: string;
  config: Record<string, string>;
}

function parseEnv(): EnvConfig {
  // Try multiple possible paths for environment files
  const possibleBasePaths = [
    path.resolve(__dirname, '../../'), // From config/lib to project root
    path.resolve(__dirname, '../../../'), // From node_modules to project root
    path.resolve(__dirname, '../'), // From client directory to project root
    process.cwd(), // Current working directory
    path.resolve(process.cwd(), '../'), // From client directory to project root
  ];
  
  let foundEnvFiles: Array<{ path: string, isProd: boolean }> = [];
  
  // Search for .env files in all possible locations
  for (const basePath of possibleBasePaths) {
    const localenv = path.join(basePath, '.env');
    const prodenv = path.join(basePath, '.env.prod');
    
    const envFiles = [
      { path: prodenv, isProd: true },
      { path: localenv, isProd: false }
    ];
    
    const availableEnvFiles = envFiles.filter(({ path: envPath }) => fs.existsSync(envPath));
    
    if (availableEnvFiles.length > 0) {
      foundEnvFiles = availableEnvFiles;
      break; // Use the first location where we find env files
    }
  }
  
  if (foundEnvFiles.length === 0) {
    // Show all possible paths in error message for debugging
    const allPossiblePaths: string[] = [];
    for (const basePath of possibleBasePaths) {
      allPossiblePaths.push(path.join(basePath, '.env'));
      allPossiblePaths.push(path.join(basePath, '.env.prod'));
    }
    
    throw new Error(
      `No environment file found. Searched in these locations:\n` +
      allPossiblePaths.map((p: string) => `- ${p}`).join('\n') +
      `\n\nPlease create a .env file in your project root directory.`
    );
  }

  const file = foundEnvFiles.find(({ isProd: prod }) => isProd === prod)?.path || 
               foundEnvFiles[0].path;
  try {
    const envContent = fs.readFileSync(file, 'utf8');
    const config = dotenv.parse(envContent);
    
    if (Object.keys(config).length === 0) {
      console.warn(`Warning: No environment variables found in ${file}`);
    }

    return { file, config };
  } catch (error) {
    throw new Error(`Failed to parse ${file}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const { file, config } = parseEnv();