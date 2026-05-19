const fs = require('fs');
const os = require('os');
const path = require('path');

function createStandaloneProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reactpress-test-'));
  const reactpressDir = path.join(root, '.reactpress');
  fs.mkdirSync(reactpressDir, { recursive: true });

  fs.writeFileSync(
    path.join(reactpressDir, 'config.json'),
    JSON.stringify(
      {
        version: 1,
        database: { mode: 'embedded-docker', containerName: 'reactpress_cli_db' },
        server: {
          port: 3002,
          clientUrl: 'http://localhost:3001',
          serverUrl: 'http://localhost:3002',
        },
      },
      null,
      2
    )
  );

  fs.writeFileSync(
    path.join(root, '.env'),
    [
      'DB_HOST=127.0.0.1',
      'DB_PORT=3307',
      'DB_USER=reactpress',
      'DB_PASSWD=reactpress',
      'DB_DATABASE=reactpress',
      'CLIENT_SITE_URL=http://localhost:3001',
      'SERVER_SITE_URL=http://localhost:3002',
      'SERVER_PORT=3002',
      'SERVER_API_PREFIX=/api',
      '',
    ].join('\n')
  );

  fs.copyFileSync(
    path.join(__dirname, '../../templates/docker-compose.yml'),
    path.join(reactpressDir, 'docker-compose.yml')
  );

  return root;
}

function createMonorepoFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reactpress-mono-'));
  fs.writeFileSync(path.join(root, 'pnpm-workspace.yaml'), 'packages:\n  - server\n  - client\n');
  fs.mkdirSync(path.join(root, 'server', 'src'), { recursive: true });
  fs.writeFileSync(path.join(root, 'server', 'src', 'main.ts'), 'export {};\n');
  fs.writeFileSync(
    path.join(root, 'server', 'package.json'),
    JSON.stringify({ name: 'server', scripts: { build: 'echo build' } })
  );
  fs.mkdirSync(path.join(root, 'client'));
  fs.writeFileSync(
    path.join(root, 'client', 'package.json'),
    JSON.stringify({ name: 'client', scripts: { dev: 'echo dev' } })
  );
  fs.mkdirSync(path.join(root, 'toolkit'));
  fs.writeFileSync(
    path.join(root, 'toolkit', 'package.json'),
    JSON.stringify({ name: 'toolkit', scripts: { build: 'echo build' } })
  );
  return root;
}

function rmDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

module.exports = { createStandaloneProject, createMonorepoFixture, rmDir };
