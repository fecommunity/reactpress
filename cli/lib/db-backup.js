const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

function parseEnv(projectRoot) {
  const envPath = path.join(projectRoot, '.env');
  const out = {};
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // ignore
  }
  return out;
}

async function runDbBackup(projectRoot, outputPath) {
  const env = parseEnv(projectRoot);
  const host = env.DB_HOST || '127.0.0.1';
  const port = env.DB_PORT || '3306';
  const user = env.DB_USER || 'root';
  const password = env.DB_PASSWD || env.DB_PASSWORD || 'root';
  const database = env.DB_DATABASE || 'reactpress';
  const out =
    outputPath ||
    path.join(projectRoot, `reactpress-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`);

  const cmd = `mysqldump -h ${host} -P ${port} -u ${user} -p${password} ${database}`;
  console.log(chalk.cyan('[reactpress]'), `备份数据库到 ${out}`);
  try {
    const dump = execSync(cmd, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
    fs.writeFileSync(out, dump, 'utf8');
    console.log(chalk.green('[reactpress]'), '备份完成');
    return out;
  } catch (err) {
    console.error(chalk.red('[reactpress]'), 'mysqldump 失败，请确认已安装 MySQL 客户端且 .env 正确');
    throw err;
  }
}

module.exports = { runDbBackup };
