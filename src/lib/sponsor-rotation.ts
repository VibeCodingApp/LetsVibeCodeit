export const SPONSOR_ROTATION_MS = 15000;

export function rotatingSponsorForSlot<T>(sponsors: T[], slot: string, tick: number, capacity: number): T | null {
  if (!sponsors.length) return null;
  const positions = shuffle(Array.from({ length: capacity }, (_, index) => index), tick + 17).slice(0, Math.min(sponsors.length, capacity));
  const position = hash(`${slot}:${tick}`) % capacity;
  const sponsorPosition = positions.indexOf(position);
  if (sponsorPosition < 0) return null;
  const order = shuffle(Array.from({ length: sponsors.length }, (_, index) => index), tick + 31);
  return sponsors[order[sponsorPosition % order.length]];
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
