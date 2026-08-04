'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import type { SponsorPlacement } from '@/lib/sponsors';
import { SPONSOR_ROTATION_MS, rotatingSponsorForSlot, sponsorPoolCapacity } from '@/lib/sponsor-rotation';
import { trackSponsorEvent } from '@/lib/sponsor-events';
import { SponsorPurchaseButton } from './sponsor-purchase-button';

export const SITE_HEADER_HEIGHT = 54;

type AdSlotProps = {
  slot: string;
  format?: string;
  className?: string;
  sticky?: boolean;
  isActive?: boolean;
  anchorIndex?: number;
};

type StickyAdLayerProps = {
  slot: string | null;
};

type StickyAdRootRef = {
  current: HTMLElement | null;
};

export function useStickyAdIndex(
  rootRef: StickyAdRootRef,
  anchorCount: number,
  onChange: (index: number | null) => void,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || anchorCount === 0) {
      onChange(null);
      return;
    }

    let frame: number | null = null;
    let previousIndex: number | null | undefined;

    const update = () => {
      const rootRect = root.getBoundingClientRect();
      const header = document.querySelector<HTMLElement>('[data-site-header]');
      const headerHeight = header?.getBoundingClientRect().height ?? SITE_HEADER_HEIGHT;
      const stickyLine = window.scrollY + headerHeight;
      const rootTop = window.scrollY + rootRect.top;
      const rootBottom = window.scrollY + rootRect.bottom;
      const anchors = Array.from(root.querySelectorAll<HTMLElement>('[data-ad-anchor]'));

      let nextIndex: number | null = null;

      if (stickyLine >= rootTop && stickyLine < rootBottom) {
        anchors.forEach((anchor, index) => {
          const anchorTop = window.scrollY + anchor.getBoundingClientRect().top;
          if (anchorTop <= stickyLine) nextIndex = index;
        });
      }

      if (nextIndex !== previousIndex) {
        previousIndex = nextIndex;
        onChange(nextIndex);
      }
    };

    const scheduleUpdate = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        update();
      });
    };

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(scheduleUpdate);

    resizeObserver?.observe(root);
    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      resizeObserver?.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [anchorCount, onChange, rootRef]);
}

export function AdSlot({
  slot,
  className = '',
  sticky = false,
  isActive = false,
  anchorIndex,
}: AdSlotProps) {
  const [sponsors, setSponsors] = useState<SponsorPlacement[]>([]);
  const [rotationTick, setRotationTick] = useState(0);
  useEffect(() => {
    fetch('/api/sponsors/active', { cache: 'no-store' }).then(response => response.ok ? response.json() : []).then((items: SponsorPlacement[]) => setSponsors(items.filter(item => item.plan === 'inList'))).catch(() => undefined);
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setRotationTick(value => value + 1), SPONSOR_ROTATION_MS);
    return () => window.clearInterval(timer);
  }, []);
  const anchorProps = anchorIndex === undefined
    ? {}
    : { 'data-ad-anchor': anchorIndex };

  const surfaceClassName = [
     'relative w-full flex flex-col items-center justify-center gap-2 py-1.5 sm:py-8',
    'border border-dashed border-[var(--border-2)] rounded-xl',
    sticky
      ? 'bg-[var(--glass-bg)] backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(0,0,0,.28)]'
       : 'bg-[var(--surface)]/90 backdrop-blur-sm',
  ].join(' ');
  const capacity = sponsorPoolCapacity(sponsors.length);
  const purchaseSlotId = `in-list-${(slotHash(slot) % capacity) + 1}`;
  const sponsor = rotatingSponsorForSlot(sponsors, slot, rotationTick, capacity);
  useEffect(() => {
    if (sponsor) trackSponsorEvent(sponsor.sessionId, 'impression', `in-list:${slot}`);
  }, [sponsor, slot]);

  return (
    <div
      className={['w-full', isActive && !sticky ? 'invisible' : '', className].filter(Boolean).join(' ')}
      data-ad-slot={slot}
      data-sticky-ad={sticky ? 'true' : undefined}
      aria-hidden={isActive && !sticky ? true : undefined}
      {...anchorProps}
      >
        <div className={surfaceClassName} data-sticky-surface={sticky ? 'true' : undefined}>
          {sponsor ? <InListSponsor sponsor={sponsor} placement={slot} /> : <InListPlaceholder slotId={purchaseSlotId} />}
        </div>
    </div>
  );
}

function slotHash(slot: string): number {
  return Array.from(slot).reduce((total, char) => total + char.charCodeAt(0), 0);
}

function InListSponsor({ sponsor, placement }: { sponsor: SponsorPlacement; placement: string }) {
  const onClick = () => trackSponsorEvent(sponsor.sessionId, 'click', `in-list:${placement}`);
  if (sponsor.creativeMode === 'banner') return <><div aria-hidden className="invisible flex flex-col items-center justify-center gap-2"><div className="flex items-center gap-3"><span className="font-mono text-[10px] uppercase tracking-[0.08em]">In-List Ad</span><span className="font-display text-base font-bold">$79</span><span className="font-mono text-[10px]">/30 days</span></div><span className="font-mono text-[11px]">promote your product in the vibecoded list</span></div><a href={sponsor.website} target="_blank" rel="sponsored noopener noreferrer" onClick={onClick} aria-label={`${sponsor.name} sponsored placement`} className="absolute inset-0 z-10 block overflow-hidden rounded-lg no-underline"><img src={sponsor.bannerUrl} alt={sponsor.name} className="h-full w-full object-fill" /></a></>;
  return <a href={sponsor.website} target="_blank" rel="sponsored noopener noreferrer" onClick={onClick} className="flex w-full flex-col items-start gap-1.5 text-left no-underline"><img src={sponsor.iconUrl} alt="" className="h-8 w-8 rounded-lg object-cover" /><span className="font-display text-sm font-bold text-fg">{sponsor.name}</span><span className="line-clamp-2 text-[11px] text-muted-2">{sponsor.description}</span><span className="font-mono text-[10px] uppercase tracking-[0.08em] text-warning">Sponsored</span></a>;
}

function InListPlaceholder({ slotId }: { slotId: string }) {
  return <SponsorPurchaseButton plan="inList" slotId={slotId} ariaLabel="Buy in-list sponsor placement" className="flex w-full flex-col items-center justify-center gap-2"><div className="flex items-center gap-3"><span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-2">In-List Ad</span><span className="font-display text-base font-bold text-primary">$79</span><span className="font-mono text-[10px] text-muted-2">/30 days</span></div><span className="font-mono text-[11px] text-muted-2">promote your product in the vibecoded list</span></SponsorPurchaseButton>;
}

export function StickyAdLayer({ slot }: StickyAdLayerProps) {
  if (!slot) return null;

  return (
    <div
      className="fixed left-1/2 z-40 container-main -translate-x-1/2 pointer-events-auto"
      style={{ top: SITE_HEADER_HEIGHT }}
      data-sticky-ad-layer
      data-sticky-state="active"
    >
      <AdSlot slot={slot} sticky />
    </div>
  );
}
