import type { AppRow, FilterState } from './types';

export function filterApps(rows: AppRow[], f: FilterState): AppRow[] {
  let res = [...rows];
  if (f.category !== 'all') res = res.filter(a => a.category === f.category);
  if (f.verdict !== 'all') res = res.filter(a => a.verdict === f.verdict);
  if (f.search.trim()) {
    const q = f.search.toLowerCase();
    res = res.filter(a => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
  }
  if (f.sort === 'votes') res.sort((a, b) => b.votes - a.votes || b.pagePriority - a.pagePriority);
  else if (f.sort === 'name') res.sort((a, b) => a.name.localeCompare(b.name));
  else if (f.sort === 'price') res.sort((a, b) => (a.priceMonthly ?? 0) - (b.priceMonthly ?? 0));
  return res;
}

export function computeMRR(apps: { priceMonthly: number | null; verdict: 'yes' | 'kinda' | 'no' }[]): number {
  return apps.filter(a => a.verdict === 'yes').reduce((s, a) => s + (a.priceMonthly ?? 0), 0);
}

export function getTopCategories(apps: { category: string }[], limit = 12): string[] {
  const m = new Map<string, number>();
  apps.forEach(a => m.set(a.category, (m.get(a.category) || 0) + 1));
  return ['all', ...Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit - 1).map(([k]) => k)];
}

export function getAllCategories(apps: { category: string }[]): string[] {
  return Array.from(new Set(apps.map(a => a.category))).sort();
}
