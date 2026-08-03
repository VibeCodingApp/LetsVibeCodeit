import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let cached: Promise<Array<{ name: string; data: ArrayBuffer; weight: 400 | 500 | 700; style: 'normal' }>> | null = null;

function localFallback(): Array<{ name: string; data: ArrayBuffer; weight: 400 | 500 | 700; style: 'normal' }> {
  try {
    const path = join(process.cwd(), 'node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf');
    const data = readFileSync(path).buffer.slice(0) as ArrayBuffer;
    return [{ name: 'Noto Sans', data, weight: 400, style: 'normal' }];
  } catch {
    return [];
  }
}

const cssUrl =
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap';

function extractFontUrls(css: string): Map<string, string> {
  const map = new Map<string, string>();
  const faces = css.match(/@font-face\s*\{[\s\S]*?\}/g) || [];
  for (const face of faces) {
    const weightMatch = face.match(/font-weight:\s*(\d+);/);
    const urlMatch = face.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
    if (weightMatch && urlMatch) {
      if (weightMatch[1] === '500') map.set('500', urlMatch[1]);
      if (weightMatch[1] === '700') map.set('700', urlMatch[1]);
    }
  }
  return map;
}

export function loadOgFonts(): Promise<Array<{ name: string; data: ArrayBuffer; weight: 400 | 500 | 700; style: 'normal' }>> {
  if (!cached) {
    cached = (async () => {
      try {
        const css = await fetch(cssUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.text());
        const urls = extractFontUrls(css);
        const entries = Array.from(urls.entries());
        const loaded = await Promise.all(
          entries.map(async ([weight, url]) => ({
            name: 'Space Grotesk',
            data: await fetch(url).then(r => r.arrayBuffer()),
            weight: (weight === '700' ? 700 : 500) as 400 | 500 | 700,
            style: 'normal' as const,
          })),
        );
        return loaded.length ? loaded : localFallback();
      } catch {
        return localFallback();
      }
    })();
  }
  return cached;
}
