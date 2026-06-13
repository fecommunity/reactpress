#!/usr/bin/env node
/**
 * Aggregate themes/{dir}/package.json catalog entries and sync to
 * cli/templates/theme-catalog.json (standalone projects without themes/ use the template).
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEST = path.join(ROOT, 'cli/templates/theme-catalog.json');

const { buildAggregatedCatalog, validateCatalogThemes } = require('../cli/lib/theme-registry.js');

function assertCatalog(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('catalog must be a JSON object');
  }
  if (!Array.isArray(raw.themes)) {
    throw new Error('catalog must contain a "themes" array');
  }
  for (const entry of raw.themes) {
    if (!entry?.id || !entry?.name || !(entry?.npm || entry?.dependency)) {
      throw new Error(`Invalid catalog entry: ${JSON.stringify(entry)}`);
    }
  }
}

const { missing } = validateCatalogThemes(ROOT);
if (missing.length) {
  throw new Error(`Missing catalog package.json entries: ${missing.join(', ')}`);
}

const raw = buildAggregatedCatalog(ROOT);
assertCatalog(raw);
fs.mkdirSync(path.dirname(DEST), { recursive: true });
fs.writeFileSync(DEST, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
console.log(`[reactpress] Synced themes/*/package.json → ${path.relative(ROOT, DEST)}`);
