'use client';

import { useState } from 'react';

const WEBP_QUALITY = 0.78;
const MAX_DIM = 2000;

async function toWebP(file: File): Promise<File> {
  if (file.type === 'image/webp' && file.size <= 500 * 1024) return file;
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_DIM / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error('bad canvas')), 'image/webp', WEBP_QUALITY));
  return new File([blob], file.name.replace(/\.\w+$/i, '.webp'), { type: 'image/webp' });
}

export function SponsorClaimForm({ sessionId, testSlot = '', plan, slot }: { sessionId: string; testSlot?: string; plan: string; slot: string }) {
  const digestOnly = plan === 'digest';
  const recommendedSize = plan === 'rail' ? '216px wide × 1/7 viewport height' : plan === 'hero' ? '200 × 360px' : plan === 'inList' ? '2126 × 239px banner, scaled to content width' : 'Email-native × up to 600px wide';
  const [mode, setMode] = useState<'banner' | 'icon-text'>(digestOnly ? 'icon-text' : 'banner');
  const [description, setDescription] = useState('');
  const [marqueeText, setMarqueeText] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('busy');
    setMessage('');
    const form = new FormData(event.currentTarget);
    for (const [name, value] of Array.from(form)) {
      if (value instanceof File && (value.type === 'image/png' || value.type === 'image/webp')) {
        try { form.set(name, await toWebP(value)); } catch { }
      }
    }
    try {
      const response = await fetch('/api/sponsor/claim', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'claim_failed');
      setStatus('done');
      setMessage(data.emailSent ? 'Your placement is live. We emailed the details and expiration date.' : 'Your placement is live, but the confirmation email could not be sent.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Could not activate the sponsorship.');
    }
  }

  if (status === 'done') return <div className="border border-primary/40 bg-surface-2 p-6"><p className="font-display text-2xl font-bold text-primary">Sponsorship activated.</p><p className="mt-3 text-sm leading-relaxed text-muted">{message}</p><a href="/" className="mt-5 inline-flex border-b border-primary pb-1 font-mono text-sm text-primary no-underline">Back to the catalog →</a></div>;

  return (
    <form onSubmit={submit} className="space-y-5 border border-[var(--border)] bg-surface-2 p-5 md:p-7">
      <input type="hidden" name="sessionId" value={sessionId} />
      {testSlot && <input type="hidden" name="testSlot" value={testSlot} />}
      <div className="flex flex-wrap gap-2 font-mono text-xs text-muted-2"><span className="rounded-full border border-[var(--border)] px-3 py-1">{plan}</span><span className="rounded-full border border-[var(--border)] px-3 py-1">{slot}</span><span className="rounded-full border border-primary/40 px-3 py-1 text-primary">paid</span></div><p className="font-mono text-xs text-muted-2">Recommended creative size: <span className="text-fg-2">{recommendedSize}</span></p>
      <label className="block"><span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">Product name</span><input name="name" required maxLength={70} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-3 text-fg outline-none focus:border-primary" placeholder="Your product" /></label>
      {!digestOnly && <fieldset><legend className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">Creative format</legend><div className="mt-2 grid gap-3 sm:grid-cols-2"><label className={`cursor-pointer rounded-lg border p-3 ${mode === 'banner' ? 'border-primary bg-primary/10' : 'border-[var(--border)]'}`}><input type="radio" name="creativeMode" value="banner" checked={mode === 'banner'} onChange={() => setMode('banner')} className="sr-only" /><span className="block font-display text-sm font-bold">Full banner</span><span className="mt-1 block text-xs text-muted">Image fills the entire slot.</span></label><label className={`cursor-pointer rounded-lg border p-3 ${mode === 'icon-text' ? 'border-primary bg-primary/10' : 'border-[var(--border)]'}`}><input type="radio" name="creativeMode" value="icon-text" checked={mode === 'icon-text'} onChange={() => setMode('icon-text')} className="sr-only" /><span className="block font-display text-sm font-bold">Icon + text</span><span className="mt-1 block text-xs text-muted">Icon sits top-left with padded text.</span></label></div></fieldset>}
      {digestOnly && <input type="hidden" name="creativeMode" value="icon-text" />}
      {mode === 'banner' ? <><label className="block"><span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">Full banner · PNG or WebP, max 2MB</span><input name="banner" required type="file" accept="image/png,image/webp" className="mt-2 block w-full rounded-lg border border-dashed border-[var(--border-2)] px-4 py-3 text-sm text-muted file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-2 file:font-semibold file:text-black" /></label><label className="block"><span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">Marquee icon · PNG or WebP, max 2MB</span><input name="marqueeIcon" required type="file" accept="image/png,image/webp" className="mt-2 block w-full rounded-lg border border-dashed border-[var(--border-2)] px-4 py-3 text-sm text-muted file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-2 file:font-semibold file:text-black" /></label><label className="block"><span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">Marquee text · 25 characters max</span><input name="marqueeText" required maxLength={25} value={marqueeText} onChange={event => setMarqueeText(event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-3 text-fg outline-none focus:border-primary" placeholder="Short mobile headline" /><span className="mt-1 block text-right font-mono text-[11px] text-muted-2">{marqueeText.length}/25</span></label></> : <label className="block"><span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">Icon · PNG or WebP, max 2MB</span><input name="icon" required type="file" accept="image/png,image/webp" className="mt-2 block w-full rounded-lg border border-dashed border-[var(--border-2)] px-4 py-3 text-sm text-muted file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-2 file:font-semibold file:text-black" /></label>}
      {mode === 'icon-text' && <label className="block"><span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">Text · 70 characters max</span><textarea name="description" required maxLength={70} value={description} onChange={event => setDescription(event.target.value)} rows={3} className="mt-2 w-full resize-none rounded-lg border border-[var(--border)] bg-transparent px-4 py-3 text-sm text-fg outline-none focus:border-primary" placeholder="What does your product help builders do?" /><span className="mt-1 block text-right font-mono text-[11px] text-muted-2">{description.length}/70</span></label>}
      <label className="block"><span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">Click destination URL</span><input name="website" required type="url" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-3 text-fg outline-none focus:border-primary" placeholder="https://yourproduct.com" /></label>
      {status === 'error' && <p className="font-mono text-xs text-danger">{message}</p>}
      <button type="submit" disabled={status === 'busy'} className="w-full rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50">{status === 'busy' ? 'Activating placement...' : 'Publish my sponsorship →'}</button>
    </form>
  );
}
