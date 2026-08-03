import { NextResponse } from 'next/server';
import { getPostHogStats, isPostHogStatsConfigured } from '@/lib/posthog';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isPostHogStatsConfigured()) {
    return NextResponse.json(
      { configured: false, stats: null, message: 'PostHog stats are not configured yet.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const stats = await getPostHogStats();
    return NextResponse.json({ configured: true, stats }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json(
      { configured: true, stats: null, message: 'PostHog stats are temporarily unavailable.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
