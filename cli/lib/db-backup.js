const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const { t } = require('./i18n');
const { mysqldumpFromDbContainer } = require('./docker');

function isLocalDbHost(host) {
  const h = String(host || '').toLowerCase();
  return h === '127.0.0.1' || h === 'localhost' || h === '::1' || h === '';
}

function isMysqldumpNotFoundError(err) {
  const msg = `${err && err.message ? err.message : ''}\n${err && err.stderr ? err.stderr : ''}`;
  if (err && err.status === 127) return true;
  return /command not found|not recognized as an internal or external command/i.test(msg);
}

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
  console.log(chalk.cyan('[reactpress]'), t('db.backup.to', { path: out }));
  try {
    const dump = execSync(cmd, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
    fs.writeFileSync(out, dump, 'utf8');
    console.log(chalk.green('[reactpress]'), t('db.backup.done'));
    return out;
  } catch (err) {
    if (isMysqldumpNotFoundError(err) && isLocalDbHost(host)) {
      const via = mysqldumpFromDbContainer(projectRoot, { user, password, database });
      if (via.ok) {
        console.log(chalk.cyan('[reactpress]'), t('db.backup.viaDocker'));
        fs.writeFileSync(out, via.stdout, 'utf8');
        console.log(chalk.green('[reactpress]'), t('db.backup.done'));
        return out;
      }
    }
    console.error(chalk.red('[reactpress]'), t('db.backup.fail'));
    throw err;
  }
}

module.exports = { runDbBackup };
