'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import type { SponsorPlacement } from '@/lib/sponsors';

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
  useEffect(() => {
    fetch('/api/sponsors/active', { cache: 'no-store' }).then(response => response.ok ? response.json() : []).then((items: SponsorPlacement[]) => setSponsors(items.filter(item => item.plan === 'inList'))).catch(() => undefined);
  }, []);
  const anchorProps = anchorIndex === undefined
    ? {}
    : { 'data-ad-anchor': anchorIndex };

  const surfaceClassName = [
    'w-full flex flex-col items-center justify-center gap-2 py-8',
    'border border-dashed border-[var(--border-2)] rounded-xl',
    sticky
      ? 'bg-[var(--glass-bg)] backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(0,0,0,.28)]'
      : 'bg-[var(--surface)]/90',
  ].join(' ');

  return (
    <div
      className={['w-full', isActive && !sticky ? 'invisible' : '', className].filter(Boolean).join(' ')}
      data-ad-slot={slot}
      data-sticky-ad={sticky ? 'true' : undefined}
      aria-hidden={isActive && !sticky ? true : undefined}
      {...anchorProps}
      >
        <div className={surfaceClassName} data-sticky-surface={sticky ? 'true' : undefined}>
          {sponsors.length ? <InListSponsor sponsor={sponsors[hashSlot(slot) % sponsors.length]} /> : <InListPlaceholder />}
        </div>
    </div>
  );
}

function hashSlot(slot: string): number {
  return Array.from(slot).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function InListSponsor({ sponsor }: { sponsor: SponsorPlacement }) {
  return <a href={sponsor.website} target="_blank" rel="sponsored noopener noreferrer" className="flex items-center gap-3 no-underline"><img src={sponsor.iconUrl} alt="" className="h-9 w-9 rounded-lg object-cover" /><span className="font-display text-sm font-bold text-fg">{sponsor.name}</span><span className="text-[11px] text-muted-2">{sponsor.description}</span><span className="ml-auto font-mono text-[10px] uppercase tracking-[0.08em] text-warning">Sponsored</span></a>;
}

function InListPlaceholder() {
  return <><div className="flex items-center gap-3"><span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-2">In-List Ad</span><span className="font-display text-base font-bold text-primary">$79</span><span className="font-mono text-[10px] text-muted-2">/30 days</span></div><span className="font-mono text-[11px] text-muted-2">promote your product in the vibecoded list</span></>;
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
