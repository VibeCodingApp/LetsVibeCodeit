import { NextResponse } from 'next/server';
import { getActiveSponsors } from '@/lib/sponsors';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sponsors = await getActiveSponsors();
  return NextResponse.json(sponsors, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
}
