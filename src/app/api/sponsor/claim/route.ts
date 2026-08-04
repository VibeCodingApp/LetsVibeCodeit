import { NextRequest, NextResponse } from 'next/server';
import { retrieveCheckoutSession, SPONSOR_PLANS, updateCheckoutMetadata, uploadSponsorAsset, type SponsorPlan } from '@/lib/stripe';
import { SLOT_GROUPS } from '@/lib/sponsors';
import { sendEmail } from '@/lib/resend';

const MAX_ICON_BYTES = 2 * 1024 * 1024;
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

  if ((!sessionId && !isTest) || name.length < 2 || name.length > 70) return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
  if (!['banner', 'icon-text'].includes(creativeMode)) return NextResponse.json({ error: 'Choose a creative format.' }, { status: 400 });
  if (creativeMode === 'icon-text' && (!description || description.length > 70)) return NextResponse.json({ error: 'Icon + text requires text of 70 characters or fewer.' }, { status: 400 });
  if (creativeMode === 'banner' && (!marqueeText || marqueeText.length > 25)) return NextResponse.json({ error: 'Banner mode requires marquee text of 25 characters or fewer.' }, { status: 400 });
  if (!URL_RE.test(website) || website.length > 300) return NextResponse.json({ error: 'Click destination must be a valid http(s) URL under 300 characters.' }, { status: 400 });
  if (!isImageFile(creativeAsset ?? null) || creativeMode === 'banner' && !isImageFile(marqueeIcon ?? null)) return NextResponse.json({ error: 'Upload valid PNG or WebP images up to 2MB.' }, { status: 400 });

  try {
    const session = await retrieveCheckoutSession(sessionId);
    const testSession = isTest && session.metadata.test === 'true' && session.metadata.slotId === 'left-1';
    const plan = session.metadata.plan as SponsorPlan;
    if (!testSession && (session.status !== 'complete' || session.payment_status !== 'paid')) return NextResponse.json({ error: 'Payment has not been confirmed yet.' }, { status: 402 });
    if (!SPONSOR_PLANS[plan] || !SLOT_GROUPS[plan]?.some(slot => slot.id === session.metadata.slotId)) return NextResponse.json({ error: 'This payment is not a LetsVibeCodeit sponsorship.' }, { status: 400 });
    if (plan === 'digest' && creativeMode !== 'icon-text') return NextResponse.json({ error: 'Weekly digest sponsorships require icon + text.' }, { status: 400 });
    if (session.metadata.claimed === 'true' || session.metadata.expiresAt) return NextResponse.json({ error: 'This sponsorship has already been claimed.' }, { status: 409 });

    const assetUrl = await uploadSponsorAsset(creativeAsset as File, creativeMode === 'banner' ? 'business_logo' : 'business_icon');
    const marqueeIconUrl = creativeMode === 'banner' ? await uploadSponsorAsset(marqueeIcon as File, 'business_icon') : assetUrl;
    const activatedAt = Date.now();
    const expiresAt = activatedAt + 30 * 24 * 60 * 60 * 1000;
    const creativeMetadata = { name, description, website, creativeMode, marqueeText: creativeMode === 'banner' ? marqueeText : name, marqueeIconUrl, bannerUrl: creativeMode === 'banner' ? assetUrl : '', iconUrl: creativeMode === 'icon-text' ? assetUrl : '', activatedAt: String(activatedAt), expiresAt: String(expiresAt), claimed: 'true' };
    await updateCheckoutMetadata(sessionId, { ...session.metadata, ...creativeMetadata });

    const recipient = session?.customer_details?.email || '';
    let emailSent = false;
    if (recipient) {
      try {
        await sendEmail(recipient, `Your LetsVibeCodeit sponsorship is live: ${name}`, confirmationEmail({ name, description, website, assetUrl, creativeMode, expiresAt }));
        emailSent = true;
      } catch {
        emailSent = false;
      }
    }
    return NextResponse.json({ ok: true, emailSent, expiresAt });
  } catch (error) {
    const detail = error instanceof Error ? `${error.message} ${error.stack ?? ''}` : 'unknown_error';
    console.error('sponsor_claim_failed', detail.slice(0, 1200));
    return NextResponse.json({ error: `We could not activate this sponsorship yet. Try again. Error: ${String(error).slice(0, 120)}` }, { status: 502 });
  }
}

function isImageFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && ALLOWED_TYPES.has(value.type) && value.size > 0 && value.size <= MAX_ICON_BYTES;
}

function confirmationEmail(data: { name: string; description: string; website: string; assetUrl: string; creativeMode: string; expiresAt: number }): string {
  const expiration = new Date(data.expiresAt).toLocaleDateString('en-US', { dateStyle: 'long' });
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#182018"><img src="${escapeHtml(data.assetUrl)}" width="96" height="64" alt="${escapeHtml(data.name)}" style="border-radius:14px;object-fit:cover"><h1 style="color:#44d17a">Your sponsorship is live</h1><p><strong>${escapeHtml(data.name)}</strong> is now scheduled in the LetsVibeCodeit sponsorship inventory.</p><p>Creative: ${escapeHtml(data.creativeMode === 'banner' ? 'full banner' : 'icon + text')}</p>${data.description ? `<p>${escapeHtml(data.description)}</p>` : ''}<p><a href="${escapeHtml(data.website)}">${escapeHtml(data.website)}</a></p><p>It expires on <strong>${expiration}</strong>. It will not renew automatically and the slot becomes available again after expiration.</p><p>Thanks for supporting independent builders.</p></div>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
}
