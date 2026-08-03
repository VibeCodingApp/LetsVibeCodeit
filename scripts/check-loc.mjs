import { readFileSync, readdirSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MAX_LINES = 400;
const SRC_DIR = join(__dirname, '..', 'src');
const failed = [];

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
        walk(fullPath);
      }
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
      const lines = readFileSync(fullPath, 'utf-8').split('\n').length;
      if (lines > MAX_LINES) {
        failed.push({ file: relative(__dirname, fullPath), lines });
      }
    }
  }
}

walk(SRC_DIR);

if (failed.length > 0) {
  console.error(`FAIL: Files exceeding ${MAX_LINES} lines:`);
  failed.forEach(f => console.error(`  ${f.file} — ${f.lines} lines`));
  process.exit(1);
}

console.log(`OK: All source files under ${MAX_LINES} lines.`);
