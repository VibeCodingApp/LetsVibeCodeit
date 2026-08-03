import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.formData().catch(() => req.json().catch(() => ({})));
  const email = typeof body === 'object' && 'email' in body ? (body as Record<string,string>).email : '';
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
  return NextResponse.json({ ok: true, email });
}
