import { NextRequest, NextResponse } from 'next/server';
import { getAppsAddedSince } from '@/lib/apps';
import { getDigestContacts, sendBatchEmail } from '@/lib/resend';
import { getActiveSponsors } from '@/lib/sponsors';
import { renderWeeklyDigest } from '@/lib/digest';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = req.headers.get('authorization');
  if (!secret || authorization !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const apps = getAppsAddedSince(since);
    const sponsors = (await getActiveSponsors()).filter(sponsor => sponsor.plan === 'digest');
    const contacts = (await getDigestContacts()).filter(contact => !contact.unsubscribed).map(contact => contact.email);
    if (!contacts.length) return NextResponse.json({ ok: true, sent: 0, apps: apps.length, sponsors: sponsors.length });
    const subject = `LetsVibeCodeit weekly // ${new Date().toISOString().slice(0, 10)}`;
    const sent = await sendBatchEmail(contacts, subject, renderWeeklyDigest(apps, sponsors));
    return NextResponse.json({ ok: true, sent, apps: apps.length, sponsors: sponsors.length });
  } catch {
    return NextResponse.json({ error: 'Digest delivery failed' }, { status: 502 });
  }
}
