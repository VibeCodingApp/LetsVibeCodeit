'use client';

import { useState } from 'react';
import posthog from 'posthog-js';

export function ReplaceButton({ slug, appName, initialVotes = 0 }: { slug: string; appName: string; initialVotes?: number }) {
  const [votes, setVotes] = useState(initialVotes);
  const [voted, setVoted] = useState(false);
  const [message, setMessage] = useState('');

  const replace = async () => {
    if (voted) return;
    try {
      const response = await fetch(`/api/vote/${slug}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ verdict: 'yes' }) });
      if (!response.ok) throw new Error('Vote failed');
      setVotes(value => value + 1);
      setVoted(true);
      setMessage(`Counted: you replaced ${appName}.`);
      if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) posthog.capture('verdict_vote', { app_slug: slug, verdict: 'yes', action: 'replaced' });
    } catch {
      setMessage('Could not save the vote. Try again.');
    }
    window.setTimeout(() => setMessage(''), 2600);
  };

  return (
    <div className="relative">
      <button type="button" onClick={replace} disabled={voted} aria-pressed={voted}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-semibold transition-all ${voted ? 'bg-primary text-black' : 'bg-primary text-black hover:brightness-110'}`}>
        <span aria-hidden="true">{voted ? '✓' : '🟢'}</span>
        I replaced this · {votes}
      </button>
      {message && <span role="status" className="absolute left-0 top-full z-10 mt-2 whitespace-nowrap rounded-md border border-[var(--border)] bg-surface-3 px-3 py-2 text-[11px] text-fg shadow-lg">{message}</span>}
    </div>
  );
}