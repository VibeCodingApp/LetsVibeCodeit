import { unstable_cache } from 'next/cache';
import { listCheckoutSessions, SPONSOR_PLANS, type SponsorPlan, type StripeCheckoutSession } from './stripe';

export type SponsorSlot = { id: string; label: string };

export interface SponsorPlacement {
  sessionId: string;
  plan: SponsorPlan;
  slotId: string;
  name: string;
  description: string;
  website: string;
  iconUrl: string;
  expiresAt: number;
}

export const SLOT_GROUPS: Record<SponsorPlan, SponsorSlot[]> = {
  rail: Array.from({ length: 14 }, (_, index) => ({
    id: `${index < 7 ? 'left' : 'right'}-${(index % 7) + 1}`,
    label: `${index < 7 ? 'L' : 'R'}${(index % 7) + 1}`,
  })),
  hero: [{ id: 'hero-left', label: 'Hero left' }, { id: 'hero-right', label: 'Hero right' }],
  inList: Array.from({ length: 6 }, (_, index) => ({ id: `in-list-${index + 1}`, label: `In-list ${index + 1}` })),
  digest: [{ id: 'weekly-digest', label: 'Weekly digest' }],
};

function sessionPlacement(session: StripeCheckoutSession): SponsorPlacement | null {
  const metadata = session.metadata || {};
  const plan = metadata.plan as SponsorPlan;
  const expiresAt = Number(metadata.expiresAt || 0);
  if (!session.id || !SPONSOR_PLANS[plan] || !metadata.slotId || !expiresAt) return null;
  if (!metadata.name || !metadata.description || !metadata.iconUrl || expiresAt <= Date.now()) return null;
  return {
    sessionId: session.id,
    plan,
    slotId: metadata.slotId,
    name: metadata.name,
    description: metadata.description,
    website: metadata.website || '/sponsor',
    iconUrl: metadata.iconUrl,
    expiresAt,
  };
}

async function loadActiveSponsors(): Promise<SponsorPlacement[]> {
  const sessions = await listCheckoutSessions('complete');
  return sessions
    .filter(session => session.payment_status === 'paid')
    .map(sessionPlacement)
    .filter(Boolean) as SponsorPlacement[];
}

const cachedActiveSponsors = unstable_cache(loadActiveSponsors, ['active-sponsors'], { revalidate: 60 });

export async function getActiveSponsors(): Promise<SponsorPlacement[]> {
  try {
    return await cachedActiveSponsors();
  } catch {
    return [];
  }
}

export async function getReservedSlotIds(): Promise<Set<string>> {
  const [open, complete] = await Promise.all([listCheckoutSessions('open'), listCheckoutSessions('complete')]);
  const reserved = new Set<string>();
  [...open, ...complete].forEach(session => {
    const slotId = session.metadata?.slotId;
    if (!slotId) return;
    const claimedExpiresAt = Number(session.metadata?.expiresAt || 0);
    const checkoutHoldUntil = session.expires_at ? session.expires_at * 1000 : (session.created + 24 * 60 * 60) * 1000;
    const holdUntil = claimedExpiresAt || checkoutHoldUntil;
    const stillActive = holdUntil > Date.now() && (session.status === 'open' || session.payment_status === 'paid');
    if (stillActive) reserved.add(slotId);
  });
  return reserved;
}

export async function getAvailableSlots(plan: SponsorPlan): Promise<SponsorSlot[]> {
  if (!process.env.STRIPE_SECRET_KEY) return SLOT_GROUPS[plan];
  try {
    const reserved = await getReservedSlotIds();
    return SLOT_GROUPS[plan].filter(slot => !reserved.has(slot.id));
  } catch {
    return [];
  }
}

export function getPlanLabel(plan: SponsorPlan): string {
  return SPONSOR_PLANS[plan].label;
}
