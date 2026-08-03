'use client';

import { useEffect } from 'react';

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
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.08em] text-muted-2 font-mono">In-List Ad</span>
          <span className="text-primary font-display font-bold text-base">$99</span>
          <span className="text-[10px] text-muted-2 font-mono">/30 days</span>
        </div>
        <span className="text-[11px] text-muted-2 font-mono">promote your product in the death list</span>
      </div>
    </div>
  );
}

export function StickyAdLayer({ slot }: StickyAdLayerProps) {
  if (!slot) return null;

  return (
    <div
      className="fixed inset-x-0 z-40 container-main pointer-events-auto"
      style={{ top: SITE_HEADER_HEIGHT }}
      data-sticky-ad-layer
      data-sticky-state="active"
    >
      <AdSlot slot={slot} sticky />
    </div>
  );
}