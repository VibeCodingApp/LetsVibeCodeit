'use client';

import { useState } from 'react';

export function SponsorClaimForm({ sessionId, plan, slot }: { sessionId: string; plan: string; slot: string }) {
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('busy');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/sponsor/claim', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'claim_failed');
      setStatus('done');
      setMessage(data.emailSent ? 'Your placement is live. We emailed the details and expiration date.' : 'Your placement is live. Add RESEND_FROM_EMAIL to enable confirmation emails.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Could not activate the sponsorship.');
    }
  }

  if (status === 'done') return <div className="border border-primary/40 bg-surface-2 p-6"><p className="font-display text-2xl font-bold text-primary">Sponsorship activated.</p><p className="mt-3 text-sm leading-relaxed text-muted">{message}</p><a href="/" className="mt-5 inline-flex border-b border-primary pb-1 font-mono text-sm text-primary no-underline">Back to the catalog →</a></div>;

  return (
    <form onSubmit={submit} className="space-y-5 border border-[var(--border)] bg-surface-2 p-5 md:p-7">
      <input type="hidden" name="sessionId" value={sessionId} />
      <div className="flex flex-wrap gap-2 font-mono text-xs text-muted-2"><span className="rounded-full border border-[var(--border)] px-3 py-1">{plan}</span><span className="rounded-full border border-[var(--border)] px-3 py-1">{slot}</span><span className="rounded-full border border-primary/40 px-3 py-1 text-primary">paid</span></div>
      <label className="block"><span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">Product name</span><input name="name" required maxLength={70} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-3 text-fg outline-none focus:border-primary" placeholder="Your product" /></label>
      <label className="block"><span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">Icon · PNG or WebP, max 2MB</span><input name="icon" required type="file" accept="image/png,image/webp" className="mt-2 block w-full rounded-lg border border-dashed border-[var(--border-2)] px-4 py-3 text-sm text-muted file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-2 file:font-semibold file:text-black" /></label>
      <label className="block"><span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">Description · 70 characters max</span><textarea name="description" required maxLength={70} value={description} onChange={event => setDescription(event.target.value)} rows={3} className="mt-2 w-full resize-none rounded-lg border border-[var(--border)] bg-transparent px-4 py-3 text-sm text-fg outline-none focus:border-primary" placeholder="What does your product help builders do?" /><span className="mt-1 block text-right font-mono text-[11px] text-muted-2">{description.length}/70</span></label>
      <label className="block"><span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">Website URL · optional</span><input name="website" type="url" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-3 text-fg outline-none focus:border-primary" placeholder="https://yourproduct.com" /></label>
      {status === 'error' && <p className="font-mono text-xs text-danger">{message}</p>}
      <button type="submit" disabled={status === 'busy'} className="w-full rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50">{status === 'busy' ? 'Activating placement...' : 'Publish my sponsorship →'}</button>
    </form>
  );
}
