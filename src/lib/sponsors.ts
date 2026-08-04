import { unstable_cache } from 'next/cache';
import { getActivePlacements, isSlotReserved, type SponsorRow } from './db';
import { SPONSOR_PLANS, type SponsorPlan } from './stripe';

export type SponsorSlot = { id: string; label: string };
export const IN_LIST_BASE_SLOTS = 12;
export const IN_LIST_SLOT_STEP = 4;

export interface SponsorPlacement {
  sessionId: string;
  plan: SponsorPlan;
  slotId: string;
  name: string;
  description: string;
  website: string;
  iconUrl: string;
  marqueeIconUrl: string;
  marqueeText: string;
  bannerUrl: string;
  creativeMode: 'banner' | 'icon-text';
  expiresAt: number;
}

function createSlotGroups(inListCount: number): Record<SponsorPlan, SponsorSlot[]> {
  return {
  rail: Array.from({ length: 14 }, (_, index) => ({
    id: `${index < 7 ? 'left' : 'right'}-${(index % 7) + 1}`,
    label: `${index < 7 ? 'L' : 'R'}${(index % 7) + 1}`,
  })),
  hero: [{ id: 'hero-left', label: 'Hero left' }, { id: 'hero-right', label: 'Hero right' }],
  inList: Array.from({ length: inListCount }, (_, index) => ({ id: `in-list-${index + 1}`, label: `In-list ${index + 1}` })),
  digest: [{ id: 'weekly-digest', label: 'Weekly digest' }],
  };
}

export function getInListSlotCount(occupiedCount: number): number {
  let count = IN_LIST_BASE_SLOTS;
  while (occupiedCount >= count) count += IN_LIST_SLOT_STEP;
  return count;
}

export const SLOT_GROUPS = createSlotGroups(IN_LIST_BASE_SLOTS);

const cachedActiveSponsors = unstable_cache(getActivePlacements, ['active-sponsors-neon'], { revalidate: 60 });

export async function getActiveSponsors(): Promise<SponsorPlacement[]> {
  try {
    return await cachedActiveSponsors();
  } catch {
    return [];
  }
}

export async function getReservedSlotIds(): Promise<Set<string>> {
  const active = await getActiveSponsors();
  const groups = createSlotGroups(getInListSlotCount(active.filter(sponsor => sponsor.plan === 'inList').length));
  const reserved = new Set<string>();
  for (const group of Object.values(groups)) {
    for (const slot of group) {
      if (await isSlotReserved(slot.id)) reserved.add(slot.id);
    }
  }
  return reserved;
}

export async function getAvailableSlots(plan: SponsorPlan): Promise<SponsorSlot[]> {
  if (!process.env.POSTGRES_URL) return SLOT_GROUPS[plan];
  try {
    const active = await getActiveSponsors();
    const groups = createSlotGroups(getInListSlotCount(active.filter(sponsor => sponsor.plan === 'inList').length));
    const reserved = await getReservedSlotIds();
    return groups[plan].filter(slot => !reserved.has(slot.id));
  } catch {
    return [];
  }
}

export function getPlanLabel(plan: SponsorPlan): string {
  return SPONSOR_PLANS[plan].label;
}
