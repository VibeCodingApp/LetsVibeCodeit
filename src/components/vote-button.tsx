'use client';

import { useState } from 'react';
import posthog from 'posthog-js';
import type { Verdict } from '@/lib/types';

export function VoteButton({ slug }: { slug: string }) {
  type V = Verdict | null;
  const [voted, setVoted] = useState<V>(null);
  const [anim, setAnim] = useState<V>(null);
  const [toast, setToast] = useState('');

  const vote = async (v: Verdict) => {
    setAnim(v);
    setTimeout(() => setAnim(null), 300);
    try {
      const response = await fetch(`/api/vote/${slug}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ verdict: v }) });
      if (!response.ok) throw new Error('Vote request failed');
      if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) posthog.capture('verdict_vote', { app_slug: slug, verdict: v });
      setVoted(v);
      setToast(`Voted ${v.toUpperCase()} on ${slug}`);
      setTimeout(() => setToast(''), 3000);
    } catch {
      setToast('Vote failed. Try again.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <div className="flex gap-2 items-center flex-wrap">
      <span className="text-xs text-muted mr-1 font-mono">Vote:</span>
      {(['yes', 'kinda', 'no'] as Verdict[]).map(v => {
        const active = voted === v;
        const popping = anim === v;
        const cls = active ? (v === 'yes' ? '!bg-[var(--yes-bg)] !text-[var(--yes-fg)] !border-[var(--primary)]' : v === 'kinda' ? '!bg-[var(--kinda-bg)] !text-[var(--kinda-fg)] !border-[var(--warning)]' : '!bg-[var(--no-bg)] !text-[var(--no-fg)] !border-[var(--danger)]') : '';
        return (
          <button key={v} onClick={() => vote(v)}
            className={`px-4 py-1.5 rounded-full font-mono text-xs font-semibold border border-[var(--border)] bg-surface-2 text-fg-2 hover:border-[var(--border-2)] transition-all ${cls} ${popping ? 'scale-110' : ''}`}>
            {v === 'yes' ? 'YES' : v === 'kinda' ? 'KINDA' : 'NO'}
          </button>
        );
      })}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-3 border border-[var(--border)] rounded-lg px-4 py-2 text-sm font-mono text-fg shadow-[0_8px_32px_rgba(0,0,0,.6)] z-50 animate-[fade-up_.3s_ease-out]">{toast}</div>}
    </div>
  );
}