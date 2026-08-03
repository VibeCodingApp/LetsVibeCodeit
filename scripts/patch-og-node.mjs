import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const target = require.resolve('next/dist/compiled/@vercel/og/index.node.js');

if (!existsSync(target)) {
  console.log('patch-og: @vercel/og bundle not found, skipping');
  process.exit(0);
}

const source = readFileSync(target, 'utf8');
const replacements = [
  ['../noto-sans-v27-latin-regular.ttf', './noto-sans-v27-latin-regular.ttf'],
  ['../yoga.wasm', './yoga.wasm'],
  ['../resvg.wasm', './resvg.wasm'],
];

let next = source;
for (const [from, to] of replacements) {
  const broken = `join(import.meta.url, "${from}")`;
  const fixed = `new URL("${to}", import.meta.url)`;
  if (next.includes(broken)) {
    next = next.split(broken).join(fixed);
  }
}

if (next === source) {
  console.log('patch-og: already patched or pattern not found, skipping');
} else {
  writeFileSync(target, next);
  console.log('patch-og: fixed @vercel/og Windows file URL resolution');
}
