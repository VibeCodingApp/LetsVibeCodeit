'use client';

import { useEffect, useState } from 'react';
import type { PostHogStats } from '@/lib/posthog';

type StatsResponse = { configured: boolean; stats: PostHogStats | null; message?: string };

const labels: Array<{ key: keyof PostHogStats; label: string }> = [
  { key: 'peakDay', label: 'Peak day views' },
  { key: 'viewsToday', label: 'Views · 24h' },
  { key: 'views7d', label: 'Views · 7d' },
  { key: 'visitors7d', label: 'Visitors · 7d' },
  { key: 'promptsCopied7d', label: 'Prompts copied · 7d' },
];

function formatValue(value: number | undefined) {
  return value === undefined ? '—' : value.toLocaleString();
}

export function StatsDashboard() {
  const [response, setResponse] = useState<StatsResponse | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const result = await fetch('/api/stats', { cache: 'no-store' }).then(r => r.json() as Promise<StatsResponse>).catch(() => null);
      if (active) setResponse(result);
    };
    load();
    const timer = window.setInterval(load, 60_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const configured = response?.configured;
  const stats = response?.stats;
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {labels.map(({ key, label }) => (
          <div key={label} className="bg-surface-2 border border-[var(--border)] rounded-xl p-5 text-center">
            <div className="font-display text-2xl md:text-3xl font-bold text-primary tabular-nums">{formatValue(stats?.[key] as number | undefined)}</div>
            <div className="text-xs text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>
      <div className="bg-surface-2 border border-[var(--border)] rounded-xl p-6 text-center text-muted text-sm">
        {!response && 'Loading live PostHog data…'}
        {response && !configured && 'Connect PostHog credentials to replace this state with live project data.'}
        {response && configured && !stats && (response.message || 'PostHog data is temporarily unavailable.')}
        {stats && `Last updated ${new Date(stats.updatedAt).toLocaleTimeString()}.`}
      </div>
    </>
  );
}
