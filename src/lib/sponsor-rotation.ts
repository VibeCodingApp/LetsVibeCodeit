export const SPONSOR_ROTATION_MS = 15000;

export function sponsorRotationIndex(count: number, slot: string, tick: number): number {
  if (count < 1) return 0;
  const seed = Array.from(slot).reduce((total, char) => total + char.charCodeAt(0), 0);
  return (seed + tick) % count;
}
