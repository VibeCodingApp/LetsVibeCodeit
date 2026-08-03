import { AdSlot } from './ad-slot';

export function DetailAdBreak({ slot }: { slot: string }) {
  return <div aria-label="In-list advertisement"><AdSlot slot={slot} /></div>;
}
