import { AdSlot } from './ad-slot';

export function DetailAdBreak({ slot }: { slot: string }) {
  return <div className="my-9" aria-label="In-list advertisement"><AdSlot slot={slot} /></div>;
}