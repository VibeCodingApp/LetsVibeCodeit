import { NextRequest, NextResponse } from 'next/server';
import { syncExternalApps, syncVibeCodeItYourself } from '@/lib/catalog-sync';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const community = await syncExternalApps();
    const vibeSite = await syncVibeCodeItYourself();
    return NextResponse.json({ ok: true, community, vibeSite });
  } catch (error) {
    console.error('catalog_sync_failed', error instanceof Error ? error.message : 'unknown_error');
    return NextResponse.json({ error: 'Catalog sync failed' }, { status: 502 });
  }
}
