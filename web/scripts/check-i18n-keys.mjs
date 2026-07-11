import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");
const en = JSON.parse(fs.readFileSync(path.join(root, "src/i18n/locales/en.json"), "utf8"));

function has(obj, keyPath) {
  return (
    keyPath
      .split(".")
      .reduce(
        (o, k) => (o && Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined),
        obj,
      ) !== undefined
  );
}

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (/\.(tsx?|jsx?)$/.test(name)) files.push(p);
  }
  return files;
}

const keyRe = /\bt\(\s*["'`]([^"'`$]+)["'`]/g;
const keys = new Set();
for (const file of walk(srcDir)) {
  const text = fs.readFileSync(file, "utf8");
  let m;
  while ((m = keyRe.exec(text))) keys.add(m[1]);
}

const missing = [...keys].filter((k) => !has(en, k)).sort();
console.log(missing.join("\n"));
console.error(`\n${missing.length} keys used in code but missing from en.json`);
