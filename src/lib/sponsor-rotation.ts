export const SPONSOR_ROTATION_MS = 15000;
export const IN_LIST_BASE_SLOTS = 12;
export const IN_LIST_SLOT_STEP = 4;

export function sponsorPoolCapacity(count: number): number {
  let capacity = IN_LIST_BASE_SLOTS;
  while (count >= capacity) capacity += IN_LIST_SLOT_STEP;
  return capacity;
}

export function rotatingSponsorForSlot<T>(sponsors: T[], slot: string, tick: number, capacity: number): T | null {
  if (!sponsors.length) return null;
  void capacity;
  const order = shuffle(Array.from({ length: sponsors.length }, (_, index) => index), hash(`${slot}:${tick}`) + 31);
  return sponsors[order[0]];
}

function hash(value: string): number {
  return Array.from(value).reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 7);
}

function shuffle<T>(values: T[], seed: number): T[] {
  const result = [...values];
  let state = Math.abs(seed) + 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const target = state % (index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}
