import { NextRequest, NextResponse } from 'next/server';

const RESEND_ENDPOINT = 'https://api.resend.com';
const AUDIENCE_NAME = 'LetsVibeCodeit Digest';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function listAudiences(key: string): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`${RESEND_ENDPOINT}/audiences`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const data = await res.json().catch(() => ({}));
  return data?.data ?? [];
}

async function createAudience(key: string): Promise<string> {
  const res = await fetch(`${RESEND_ENDPOINT}/audiences`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: AUDIENCE_NAME }),
  });
  if (!res.ok) throw new Error('create_audience_failed');
  const data = await res.json().catch(() => ({}));
  return data?.id ?? '';
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  try {
    const audiences = await listAudiences(key);
    let audienceId = audiences.find(a => a.name === AUDIENCE_NAME)?.id ?? '';
    if (!audienceId) audienceId = await createAudience(key);
    if (!audienceId) return NextResponse.json({ error: 'Provisioning failed' }, { status: 502 });

    const res = await fetch(`${RESEND_ENDPOINT}/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return NextResponse.json({ error: 'Contact failed' }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 502 });
  }
}