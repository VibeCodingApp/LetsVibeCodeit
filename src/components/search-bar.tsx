'use client';

import { useState, useRef, useEffect } from 'react';
import posthog from 'posthog-js';
import type { AppRow } from '@/lib/types';
import { VerdictBadge } from './verdict-badge';

export function SearchBar() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const results = q.trim() ? apps.filter(a => a.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : [];

  useEffect(() => {
    let alive = true;
    fetch('/api/rows')
      .then(r => (r.ok ? r.json() : []))
      .then((rows: AppRow[]) => { if (alive) setApps(rows); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectApp = (app: AppRow) => {
    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) posthog.capture('app_search_selected', { app_slug: app.slug });
    setQ('');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative max-w-[600px] mx-auto mb-7">
      <div className="flex items-center bg-surface-2 border border-[var(--border)] rounded-xl overflow-hidden transition-all focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-glow)]">
        <span className="pl-4 text-primary font-mono font-medium select-none">&gt;</span>
        <input type="text" value={q} onChange={event => { setQ(event.target.value); setOpen(true); }} onFocus={() => { if (q.trim()) setOpen(true); }} placeholder="search any app..." className="flex-1 bg-transparent border-none outline-none text-fg font-mono text-[15px] py-3.5 px-4 caret-primary placeholder:text-muted-2" />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-surface-2 border border-[var(--border)] rounded-xl max-h-[320px] overflow-y-auto z-50 shadow-[0_8px_48px_rgba(0,0,0,.6)]">
          {results.map(app => (
            <a key={app.slug} href={`/${app.slug}`} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-surface-3 transition-colors border-b border-[var(--border)] last:border-b-0 no-underline" onClick={() => selectApp(app)}>
              <img src={`https://www.google.com/s2/favicons?domain=${app.domain}&sz=32`} alt="" width={16} height={16} className="w-4 h-4 rounded shrink-0" />
              <span className="font-semibold font-display text-fg flex-1">{app.name}</span>
              <span className="text-xs text-muted">{app.category}</span>
              <VerdictBadge verdict={app.verdict} />
            </a>
          ))}
        </div>
      )}
      {open && q.trim() && results.length === 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-surface-2 border border-[var(--border)] rounded-xl z-50 shadow-[0_8px_48px_rgba(0,0,0,.6)] p-4 text-center text-muted text-sm">Not listed yet. <a href="#" className="text-primary no-underline hover:underline">Submit it as a PR →</a></div>
      )}
    </div>
  );
}