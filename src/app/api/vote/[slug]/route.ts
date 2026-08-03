import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const body = await req.json().catch(() => ({}));
  const verdict = body.verdict;
  if (!verdict || !['yes', 'kinda', 'no'].includes(verdict)) {
    return NextResponse.json({ error: 'Invalid verdict' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, slug, verdict });
}
