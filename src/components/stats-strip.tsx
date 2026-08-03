'use client';

import { useEffect, useRef, useState } from 'react';
import type { PostHogStats } from '@/lib/posthog';

function StatCard({ value, label, delay = 0 }: { value: number | null; label: string; delay?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (value === null) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || done.current) return;
      done.current = true;
      window.setTimeout(() => {
        const duration = 2000;
        const start = performance.now();
        const animate = (timestamp: number) => {
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }, delay);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, delay]);

  return (
    <div ref={ref} className="text-center group">
      <div className="font-display text-3xl md:text-4xl font-bold text-primary mb-1 tabular-nums">{value === null ? '-' : display.toLocaleString()}</div>
      <div className="text-[11px] text-muted-2 uppercase tracking-[0.06em] font-medium">{label}</div>
    </div>
  );
}

export function StatsStrip() {
  const [stats, setStats] = useState<PostHogStats | null>(null);

  useEffect(() => {
    fetch('/api/stats', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(data => setStats(data?.stats ?? null))
      .catch(() => undefined);
  }, []);

  const cards = [
    { value: stats?.peakDay ?? null, label: 'Peak Day Views' },
    { value: stats?.viewsToday ?? null, label: 'Views - 24h' },
    { value: stats?.views7d ?? null, label: 'Views - 7d' },
    { value: stats?.visitors7d ?? null, label: 'Visitors - 7d' },
  ];

  return (
    <section className="section-pad">
      <div className="container-main">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-primary font-mono">Site Analytics</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-1">Public, because why not</h2>
          </div>
          <span className="text-xs text-muted-2 font-mono">first-party - every minute</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
          {cards.map((card, index) => <StatCard key={card.label} value={card.value} label={card.label} delay={index * 100} />)}
        </div>
      </div>
    </section>
  );
}
