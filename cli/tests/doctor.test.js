'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  checkDockerForProject,
  resolveProjectProfile,
} = require('../out/lib/doctor');
const { createStandaloneProject, rmDir } = require('./helpers/tmp-project');

function createSqliteProject() {
  const root = createStandaloneProject();
  const configPath = path.join(root, '.reactpress', 'config.json');
  fs.writeFileSync(
    configPath,
    JSON.stringify(
      {
        version: 1,
        database: { mode: 'embedded-sqlite', sqlitePath: 'data/reactpress.db' },
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
  const envPath = path.join(root, '.env');
  const env = fs.readFileSync(envPath, 'utf8').replace(/^DB_HOST=.*$/m, 'DB_TYPE=sqlite');
  fs.writeFileSync(envPath, env.includes('DB_TYPE=sqlite') ? env : `${env}DB_TYPE=sqlite\n`);
  return root;
}

describe('lib/doctor', () => {
  it('skips Docker when project uses embedded-sqlite', async () => {
    const root = createSqliteProject();
    try {
      const profile = await resolveProjectProfile(root);
      assert.equal(profile.localMode, true);
      assert.equal(profile.requiresDocker, false);

      const docker = checkDockerForProject(root, profile);
      assert.equal(docker.ok, true);
      assert.match(docker.message, /SQLite local mode|无需 Docker/i);
    } finally {
      rmDir(root);
    }
  });

  it('requires Docker for embedded-docker projects', async () => {
    const root = createStandaloneProject();
    try {
      const profile = await resolveProjectProfile(root);
      assert.equal(profile.localMode, false);
      assert.equal(profile.requiresDocker, true);
    } finally {
      rmDir(root);
    }
  });
});
