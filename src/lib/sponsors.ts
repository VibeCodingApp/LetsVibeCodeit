import { unstable_cache } from 'next/cache';
import { getStripeAccountMetadata, listCheckoutSessions, SPONSOR_PLANS, type SponsorPlan, type StripeCheckoutSession } from './stripe';

export type SponsorSlot = { id: string; label: string };

export interface SponsorPlacement {
  sessionId: string;
  plan: SponsorPlan;
  slotId: string;
  name: string;
  description: string;
  website: string;
  iconUrl: string;
  bannerUrl: string;
  creativeMode: 'banner' | 'icon-text';
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
  const creativeMode = metadata.creativeMode === 'banner' ? 'banner' : 'icon-text';
  const expiresAt = Number(metadata.expiresAt || 0);
  if (!session.id || !SPONSOR_PLANS[plan] || !metadata.slotId || !expiresAt) return null;
  const assetUrl = creativeMode === 'banner' ? metadata.bannerUrl : metadata.iconUrl;
  if (!metadata.name || !assetUrl || creativeMode === 'icon-text' && !metadata.description || !metadata.website || expiresAt <= Date.now()) return null;
  return {
    sessionId: session.id,
    plan,
    slotId: metadata.slotId,
    name: metadata.name,
    description: metadata.description || '',
    website: metadata.website,
    iconUrl: metadata.iconUrl || '',
    bannerUrl: metadata.bannerUrl || '',
    creativeMode,
    expiresAt,
  };
}

function testPlacement(metadata: Record<string, string>): SponsorPlacement | null {
  const expiresAt = Number(metadata.testSponsorExpiresAt || 0);
  const creativeMode = metadata.testSponsorCreativeMode === 'banner' ? 'banner' : 'icon-text';
  const assetUrl = creativeMode === 'banner' ? metadata.testSponsorBannerUrl : metadata.testSponsorIconUrl;
  if (!expiresAt || expiresAt <= Date.now() || !metadata.testSponsorName || !metadata.testSponsorWebsite || !assetUrl) return null;
  return {
    sessionId: 'test-l1',
    plan: 'rail',
    slotId: 'left-1',
    name: metadata.testSponsorName,
    description: metadata.testSponsorDescription || '',
    website: metadata.testSponsorWebsite,
    iconUrl: metadata.testSponsorIconUrl || '',
    bannerUrl: metadata.testSponsorBannerUrl || '',
    creativeMode,
    expiresAt,
  };
}

async function loadActiveSponsors(): Promise<SponsorPlacement[]> {
  const [sessions, accountMetadata] = await Promise.all([listCheckoutSessions('complete'), getStripeAccountMetadata()]);
  const test = testPlacement(accountMetadata);
  return [test, ...sessions
    .filter(session => session.payment_status === 'paid')
    .map(sessionPlacement)
    .filter(Boolean) as SponsorPlacement[]].filter(Boolean) as SponsorPlacement[];
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
  const [complete, accountMetadata] = await Promise.all([listCheckoutSessions('complete'), getStripeAccountMetadata()]);
  const reserved = new Set<string>();
  if (testPlacement(accountMetadata)) reserved.add('left-1');
  complete.forEach(session => {
    const slotId = session.metadata?.slotId;
    if (!slotId) return;
    const claimedExpiresAt = Number(session.metadata?.expiresAt || 0);
    const stillActive = claimedExpiresAt > Date.now() && session.payment_status === 'paid';
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
