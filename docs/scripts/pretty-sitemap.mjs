/**
 * Pretty-print Docusaurus sitemap XML files after build.
 * The default sitemap stream emits a single minified line, which looks broken in browsers.
 */
import fs from 'node:fs';
import path from 'node:path';

const INDENT = '  ';

/** Indent XML for human-readable sitemap output (urlset + self-closing xhtml:link). */
export function prettifySitemapXml(xml) {
  const lines = xml.replace(/>\s+</g, '><').replace(/></g, '>\n<').trim().split('\n');

  let depth = 0;
  const formatted = lines.map((rawLine) => {
    const line = rawLine.trim();
    const isClosing = /^<\//.test(line);
    const isSelfClosing = /\/>$/.test(line);
    const isOpening =
      !isClosing && !isSelfClosing && !/^<\?/.test(line) && /^<[^!?/]/.test(line) && !/<\/.+>/.test(line);

    if (isClosing) {
      depth = Math.max(depth - 1, 0);
    }

    const result = `${INDENT.repeat(depth)}${line}`;

    if (isOpening) {
      depth += 1;
    }

    return result;
  });

  return `${formatted.join('\n')}\n`;
}

function prettifyFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(filePath, prettifySitemapXml(raw), 'utf8');
  return true;
}

export function prettifySitemapFiles(outDir) {
  const files = [path.join(outDir, 'sitemap.xml'), path.join(outDir, 'zh', 'sitemap.xml')];
  return files.filter((file) => prettifyFile(file));
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  const outDir = process.argv[2] ?? path.join(process.cwd(), 'build');
  const updated = prettifySitemapFiles(outDir);
  for (const file of updated) {
    console.log(`pretty-sitemap: formatted ${file}`);
  }
}
