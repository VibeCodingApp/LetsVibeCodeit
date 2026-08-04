'use client';
import { useEffect, useRef, useState } from 'react';

export function AppIcon({ domain, name, className = '' }: { domain: string; name: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setBroken(true);
  }, []);

  if (broken) {
    return (
      <span
        aria-hidden
        className={`inline-flex shrink-0 select-none items-center justify-center border border-[var(--border)] bg-[var(--surface-2)] font-display font-bold text-primary ${className}`}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      ref={ref}
       src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt=""
      loading="lazy"
      onError={() => setBroken(true)}
      className={`shrink-0 ${className}`}
    />
  );
}
