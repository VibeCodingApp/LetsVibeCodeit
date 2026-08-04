import { NextRequest, NextResponse } from 'next/server';
import { retrieveCheckoutSession, SPONSOR_PLANS, updateCheckoutMetadata, uploadSponsorIcon, type SponsorPlan } from '@/lib/stripe';
import { SLOT_GROUPS } from '@/lib/sponsors';
import { sendEmail } from '@/lib/resend';

const MAX_ICON_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/webp']);
const URL_RE = /^https?:\/\/[^\s]+$/i;

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const sessionId = String(form?.get('sessionId') || '');
  const name = String(form?.get('name') || '').trim();
  const description = String(form?.get('description') || '').trim();
  const website = String(form?.get('website') || '').trim();
  const icon = form?.get('icon');

  if (!sessionId || name.length < 2 || name.length > 70 || !description || description.length > 70) {
    return NextResponse.json({ error: 'Name and description are required. Description must be 70 characters or fewer.' }, { status: 400 });
  }
  if (website && (!URL_RE.test(website) || website.length > 300)) return NextResponse.json({ error: 'Website must be a valid http(s) URL under 300 characters.' }, { status: 400 });
  if (!(icon instanceof File) || !ALLOWED_TYPES.has(icon.type) || icon.size > MAX_ICON_BYTES) {
    return NextResponse.json({ error: 'Upload a PNG or WebP icon up to 2MB.' }, { status: 400 });
  }

  try {
    const session = await retrieveCheckoutSession(sessionId);
    if (session.status !== 'complete' || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment has not been confirmed yet.' }, { status: 402 });
    }
    const plan = session.metadata.plan as SponsorPlan;
    if (!SPONSOR_PLANS[plan] || !SLOT_GROUPS[plan]?.some(slot => slot.id === session.metadata.slotId)) {
      return NextResponse.json({ error: 'This payment is not a LetsVibeCodeit sponsorship.' }, { status: 400 });
    }
    if (session.metadata.claimed === 'true' || session.metadata.expiresAt) {
      return NextResponse.json({ error: 'This sponsorship has already been claimed.' }, { status: 409 });
    }

    const iconUrl = await uploadSponsorIcon(icon);
    const activatedAt = Date.now();
    const expiresAt = activatedAt + 30 * 24 * 60 * 60 * 1000;
    await updateCheckoutMetadata(sessionId, {
      ...session.metadata,
      name,
      description,
      website,
      iconUrl,
      activatedAt: String(activatedAt),
      expiresAt: String(expiresAt),
      claimed: 'true',
    });

    const recipient = session.customer_details?.email || '';
    let emailSent = false;
    if (recipient) {
      try {
        await sendEmail(recipient, `Your LetsVibeCodeit sponsorship is live: ${name}`, confirmationEmail({ name, description, website, iconUrl, expiresAt }));
        emailSent = true;
      } catch {
        emailSent = false;
      }
    }
    return NextResponse.json({ ok: true, emailSent, expiresAt });
  } catch {
    return NextResponse.json({ error: 'We could not activate this sponsorship yet. Try again.' }, { status: 502 });
  }
}

function confirmationEmail(data: { name: string; description: string; website: string; iconUrl: string; expiresAt: number }): string {
  const expiration = new Date(data.expiresAt).toLocaleDateString('en-US', { dateStyle: 'long' });
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#182018"><img src="${escapeHtml(data.iconUrl)}" width="64" height="64" alt="" style="border-radius:14px"><h1 style="color:#44d17a">Your sponsorship is live</h1><p><strong>${escapeHtml(data.name)}</strong> is now scheduled in the LetsVibeCodeit sponsorship inventory.</p><p>${escapeHtml(data.description)}</p>${data.website ? `<p><a href="${escapeHtml(data.website)}">${escapeHtml(data.website)}</a></p>` : ''}<p>It expires on <strong>${expiration}</strong>. It will not renew automatically and the slot becomes available again after expiration.</p><p>Thanks for supporting independent builders.</p></div>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
}
