import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import type { AppData, AppRow } from './types';

const DIR = join(process.cwd(), 'data', 'apps');

let _cache: AppData[] | null = null;

export function getAllApps(): AppData[] {
  if (_cache) return _cache;
  _cache = readdirSync(DIR).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(join(DIR, f), 'utf-8')) as AppData);
  return _cache;
}

export function getAppBySlug(slug: string): AppData | undefined {
  return getAllApps().find(a => a.slug === slug);
}

export function getAppRows(): AppRow[] {
  return getAllApps().map(a => ({ slug: a.slug, name: a.name, domain: a.domain, category: a.category, priceMonthly: a.priceMonthly, verdict: a.verdict, votes: a.reportedReplacements, pagePriority: a.pagePriority, reportedReplacements: a.reportedReplacements }));
}

export function getAppCount(): number { return getAllApps().length; }
export function getPricedCount(): number { return getAllApps().filter(a => !!a.priceMonthly && a.priceMonthly > 0).length; }

export function getRelatedApps(slug: string, limit = 6): AppData[] {
  const app = getAppBySlug(slug);
  if (!app) return [];
  return app.relatedSlugs.map(s => getAppBySlug(s)).filter(Boolean).slice(0, limit) as AppData[];
}

export function getAppsByCategory(cat: string): AppData[] {
  return getAllApps().filter(a => a.category === cat).sort((a, b) => b.pagePriority - a.pagePriority);
}

export function getAppsByMoat(tag: string): AppData[] {
  return getAllApps().filter(a => a.moatTags.includes(tag)).sort((a, b) => b.pagePriority - a.pagePriority);
}

export function getCategoryCounts(): { cat: string; count: number }[] {
  const m = new Map<string, number>();
  getAllApps().forEach(a => m.set(a.category, (m.get(a.category) || 0) + 1));
  return Array.from(m.entries()).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count);
}
