import { NextRequest, NextResponse } from 'next/server';
import { retrieveCheckoutSession, SPONSOR_PLANS, type SponsorPlan } from '@/lib/stripe';
import { SLOT_GROUPS } from '@/lib/sponsors';
import { insertPlacement } from '@/lib/db';
import { sendEmail } from '@/lib/resend';

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/webp']);
const URL_RE = /^https?:\/\/[^\s]+$/i;

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const sessionId = String(form?.get('sessionId') || '');
  const testSlot = String(form?.get('testSlot') || '');
  const isTest = Boolean(sessionId && testSlot === 'left-1');
  const name = String(form?.get('name') || '').trim();
  const creativeMode = String(form?.get('creativeMode') || '');
  const description = String(form?.get('description') || '').trim();
  const marqueeText = String(form?.get('marqueeText') || '').trim();
  const website = String(form?.get('website') || '').trim();
  const creativeAsset = form?.get(creativeMode === 'banner' ? 'banner' : 'icon');
  const marqueeIcon = form?.get('marqueeIcon');

  if (!sessionId || name.length < 2 || name.length > 70) return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
  if (!['banner', 'icon-text'].includes(creativeMode)) return NextResponse.json({ error: 'Choose a creative format.' }, { status: 400 });
  if (creativeMode === 'icon-text' && (!description || description.length > 70)) return NextResponse.json({ error: 'Icon + text requires text of 70 characters or fewer.' }, { status: 400 });
  if (creativeMode === 'banner' && (!marqueeText || marqueeText.length > 25)) return NextResponse.json({ error: 'Banner mode requires marquee text of 25 characters or fewer.' }, { status: 400 });
  if (!URL_RE.test(website) || website.length > 300) return NextResponse.json({ error: 'Click destination must be a valid http(s) URL under 300 characters.' }, { status: 400 });
  if (!isImageFile(creativeAsset ?? null) || creativeMode === 'banner' && !isImageFile(marqueeIcon ?? null)) return NextResponse.json({ error: 'Upload valid PNG or WebP images up to 2MB.' }, { status: 400 });

  try {
    const session = await retrieveCheckoutSession(sessionId);
    const testSession = isTest && session.metadata.test === 'true' && session.metadata.slotId === 'left-1';
    const plan = session.metadata.plan as SponsorPlan;
    const slotId = session.metadata.slotId || 'left-1';
    if (!testSession && (session.status !== 'complete' || session.payment_status !== 'paid')) return NextResponse.json({ error: 'Payment has not been confirmed yet.' }, { status: 402 });
    const validSlot = plan === 'inList' ? /^in-list-\d+$/.test(slotId) : SLOT_GROUPS[plan]?.some(s => s.id === slotId);
    if (!SPONSOR_PLANS[plan] || !validSlot) return NextResponse.json({ error: 'Invalid sponsorship slot.' }, { status: 400 });
    if (plan === 'digest' && creativeMode !== 'icon-text') return NextResponse.json({ error: 'Weekly digest sponsorships require icon + text.' }, { status: 400 });

    const bannerBase64 = creativeMode === 'banner' ? await toBase64(creativeAsset as File) : '';
    const iconBase64 = creativeMode === 'icon-text' ? await toBase64(creativeAsset as File) : '';
    const marqueeIconBase64 = creativeMode === 'banner' ? await toBase64(marqueeIcon as File) : iconBase64;

    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

    await insertPlacement({
      sessionId,
      plan,
      slotId,
      name,
      description,
      website,
      creativeMode,
      bannerBase64,
      iconBase64,
      marqueeIconBase64,
      marqueeText: creativeMode === 'banner' ? marqueeText : name,
      expiresAt,
    });

    let emailSent = false;
    const recipient = session.customer_details?.email || '';
    if (recipient) {
      try {
        await sendEmail(recipient, `Your LetsVibeCodeit sponsorship is live: ${name}`, confirmationEmail({ name, description, website, expiresAt }));
        emailSent = true;
      } catch {
        emailSent = false;
      }
    }
    return NextResponse.json({ ok: true, emailSent, expiresAt });
  } catch (error) {
    const detail = error instanceof Error ? `${error.message} ${error.stack ?? ''}` : 'unknown_error';
    console.error('sponsor_claim_failed', detail.slice(0, 1200));
    return NextResponse.json({ error: `We could not activate this sponsorship yet. Error: ${String(error).slice(0, 120)}` }, { status: 502 });
  }
}

async function toBase64(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString('base64');
}

function isImageFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && ALLOWED_TYPES.has(value.type) && value.size > 0 && value.size <= MAX_BYTES;
}

function confirmationEmail(data: { name: string; description: string; website: string; expiresAt: number }): string {
  const expiration = new Date(data.expiresAt).toLocaleDateString('en-US', { dateStyle: 'long' });
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#182018"><h1 style="color:#44d17a">Your sponsorship is live</h1><p><strong>${escapeHtml(data.name)}</strong> is now active in the LetsVibeCodeit sponsor inventory.</p>${data.description ? `<p>${escapeHtml(data.description)}</p>` : ''}<p><a href="${escapeHtml(data.website)}">${escapeHtml(data.website)}</a></p><p>It expires on <strong>${expiration}</strong>. It will not renew automatically.</p></div>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
}
