import { NextRequest, NextResponse } from 'next/server';
import { recordSponsorEvent } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.slice(0, 200) : '';
  const eventType = body?.eventType === 'click' || body?.eventType === 'impression' ? body.eventType : '';
  const placement = typeof body?.placement === 'string' ? body.placement.slice(0, 120) : '';
  const pagePath = typeof body?.pagePath === 'string' ? body.pagePath.slice(0, 300) : '';
  if (!sessionId || !eventType || !placement || !pagePath) return NextResponse.json({ error: 'Invalid sponsor event' }, { status: 400 });
  try {
    await recordSponsorEvent({ sessionId, eventType, placement, pagePath });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Event unavailable' }, { status: 503 });
  }
}
