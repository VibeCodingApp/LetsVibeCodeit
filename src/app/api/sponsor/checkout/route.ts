import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, SPONSOR_PLANS, type SponsorPlan } from '@/lib/stripe';
import { SLOT_GROUPS, getAvailableSlots } from '@/lib/sponsors';

function isPlan(value: unknown): value is SponsorPlan {
  return typeof value === 'string' && value in SPONSOR_PLANS;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const plan = body?.plan;
  const slotId = typeof body?.slotId === 'string' ? body.slotId : '';
  if (!isPlan(plan) || !SLOT_GROUPS[plan].some(slot => slot.id === slotId)) {
    return NextResponse.json({ error: 'Invalid sponsorship slot' }, { status: 400 });
  }

  try {
    const available = await getAvailableSlots(plan);
    if (!available.some(slot => slot.id === slotId)) {
      return NextResponse.json({ error: 'That slot was just reserved. Choose another one.' }, { status: 409 });
    }
    if (plan === 'rail' && slotId === 'left-1') return NextResponse.json({ checkoutUrl: '/sponsor/claim?test_slot=left-1' });
    const session = await createCheckoutSession(plan, slotId);
    return NextResponse.json({ sessionId: session.id, checkoutUrl: session.url });
  } catch {
    return NextResponse.json({ error: 'Checkout is temporarily unavailable.' }, { status: 503 });
  }
}
