#!/usr/bin/env node
/**
 * Seed legacy (no variants) JPEG assets for image-optimizer plugin testing.
 *
 * Usage:
 *   node scripts/seed-legacy-media.mjs
 *   node scripts/seed-legacy-media.mjs --count 5
 *   node scripts/seed-legacy-media.mjs --clean
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

function parseArgs(argv) {
  const args = { site: '', count: 3, clean: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--clean') args.clean = true;
    else if (arg === '--count') {
      args.count = Math.max(1, Number(argv[++i]) || 3);
    } else if (arg === '--site') {
      args.site = argv[++i] || '';
    }
  }
  if (!args.site) {
    args.site = path.join(repoRoot, '.reactpress', 'desktop-dev-site');
  }
  return args;
}

function openDb(dbPath) {
  try {
    return require('better-sqlite3')(dbPath);
  } catch {
    const mod = spawnSync('sqlite3', ['--version'], { encoding: 'utf8' });
    if (mod.status !== 0) {
      throw new Error('Need better-sqlite3 (pnpm install) or sqlite3 CLI');
    }
    return { cli: true, dbPath };
  }
}

function runSqliteCli(dbPath, sql) {
  const res = spawnSync('sqlite3', [dbPath, sql], { encoding: 'utf8' });
  if (res.status !== 0) {
    throw new Error(res.stderr || 'sqlite3 failed');
  }
  return res.stdout;
}

async function loadSharp() {
  const sharpPath = path.join(repoRoot, 'server', 'node_modules', 'sharp');
  if (!fs.existsSync(sharpPath)) {
    throw new Error('sharp not found. Run: pnpm install');
  }
  return require(path.join(sharpPath));
}

async function writeLegacyJpeg(targetPath, index) {
  const sharp = await loadSharp();
  const width = 1200 + index * 200;
  const height = 800 + index * 100;
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${(0x224466 + index * 0x111111).toString(16).slice(0, 6)}"/>
      <text x="50%" y="50%" font-size="48" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
        legacy-mock-${index + 1}
      </text>
    </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(targetPath);
  return fs.statSync(targetPath).size;
}

function insertFile(db, row) {
  if (db.cli) {
    const sql = `INSERT INTO file (id, originalname, filename, type, size, url, variants, create_at)
VALUES ('${row.id}', '${row.originalname}', '${row.filename}', '${row.type}', ${row.size}, '${row.url}', NULL, datetime('now'));`;
    runSqliteCli(db.dbPath, sql);
    return;
  }
  db
    .prepare(
      `INSERT INTO file (id, originalname, filename, type, size, url, variants, create_at)
       VALUES (@id, @originalname, @filename, @type, @size, @url, NULL, datetime('now'))`,
    )
    .run(row);
}

function deleteMocks(db) {
  if (db.cli) {
    runSqliteCli(
      db.dbPath,
      "DELETE FROM file WHERE originalname LIKE 'legacy-mock-%';",
    );
    return;
  }
  db.prepare("DELETE FROM file WHERE originalname LIKE 'legacy-mock-%'").run();
}

async function main() {
  const { site, count, clean } = parseArgs(process.argv);
  const uploadsDir = path.join(site, 'uploads');
  const envPath = path.join(site, '.env');
  let dbPath = path.join(site, '.reactpress', 'reactpress.db');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    const dbMatch = env.match(/^DB_DATABASE=(.+)$/m);
    if (dbMatch) {
      const raw = dbMatch[1].trim().replace(/^['"]|['"]$/g, '');
      dbPath = path.isAbsolute(raw) ? raw : path.join(site, raw);
    }
  }
  if (!fs.existsSync(dbPath)) {
    const legacy = path.join(site, 'data', 'reactpress.db');
    if (fs.existsSync(legacy)) dbPath = legacy;
  }

  if (!fs.existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
    console.error('Start dev:web:local once to initialize the local site, then re-run.');
    process.exit(1);
  }

  let apiBase = 'http://127.0.0.1:3002/public/uploads';
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    const port = env.match(/^SERVER_PORT=(\d+)/m)?.[1] ?? '3002';
    apiBase = `http://127.0.0.1:${port}/public/uploads`;
  }

  const db = openDb(dbPath);

  if (clean) {
    deleteMocks(db);
    for (const entry of fs.readdirSync(uploadsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = path.join(uploadsDir, entry.name);
      for (const file of fs.readdirSync(dir)) {
        if (file.startsWith('legacy-mock-')) {
          fs.unlinkSync(path.join(dir, file));
        }
      }
    }
    console.log('Removed legacy-mock-* records and files.');
    process.exit(0);
  }

  const folder = new Date().toISOString().slice(0, 10);
  const targetDir = path.join(uploadsDir, folder);
  fs.mkdirSync(targetDir, { recursive: true });

  const created = [];
  for (let i = 0; i < count; i += 1) {
    const name = `legacy-mock-${i + 1}.jpg`;
    const filename = `${folder}/${name}`;
    const filePath = path.join(targetDir, name);
    const size = await writeLegacyJpeg(filePath, i);
    const row = {
      id: randomUUID(),
      originalname: name,
      filename,
      type: 'image/jpeg',
      size,
      url: `${apiBase}/${filename}`,
    };
    insertFile(db, row);
    created.push(row);
  }

  console.log(`Seeded ${created.length} legacy media item(s) under ${site}`);
  console.log('');
  for (const row of created) {
    console.log(`  - ${row.originalname} (${row.size} bytes, no variants)`);
  }
  console.log('');
  console.log('Next: open 插件 → 图片资源优化 → 设置 → 分析现状 / 试运行');
  console.log('Clean: node scripts/seed-legacy-media.mjs --clean');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
