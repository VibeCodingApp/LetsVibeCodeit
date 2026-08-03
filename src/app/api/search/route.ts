import { NextRequest, NextResponse } from 'next/server';
import { getAllApps } from '@/lib/apps';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  const apps = getAllApps();
  const results = apps.filter(a => a.name.toLowerCase().includes(q.toLowerCase()) || a.category.toLowerCase().includes(q.toLowerCase())).slice(0, 20).map(a => ({ slug: a.slug, name: a.name, category: a.category, verdict: a.verdict, priceMonthly: a.priceMonthly }));
  return NextResponse.json({ results });
}
