'use client';
import { useState } from 'react';

export function DigestCard() {
  const [email, setEmail] = useState('');
  const handle = (e: React.FormEvent) => { e.preventDefault(); if(email){alert(`Subscribed ${email}! (demo)`);setEmail('');} };
  return (
    <section className="section-pad">
      <div className="container-main">
        <div className="text-center max-w-[520px] mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Every week, more subscriptions die.</h2>
          <p className="text-muted text-sm md:text-base mb-6">New verdicts, new prompts, the week&rsquo;s most-doomed apps. One email. Unsubscribe in one click.</p>
          <form onSubmit={handle} className="flex flex-col sm:flex-row gap-3 mx-auto">
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" required className="flex-1 px-4 py-3.5 rounded-lg border border-[var(--border)] bg-transparent text-fg font-mono text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-2" />
            <input type="text" className="absolute opacity-0 h-0 w-0 -z-10 pointer-events-none" name="website" autoComplete="off" tabIndex={-1} placeholder="Leave this empty" />
            <button type="submit" className="px-6 py-3.5 rounded-lg bg-primary text-black font-display font-semibold text-sm hover:brightness-110 hover:-translate-y-0.5 transition-all shadow-[0_4px_16px_var(--primary-glow)] hover:shadow-[0_6px_24px_var(--primary-glow-strong)] whitespace-nowrap">Get the digest</button>
          </form>
          <p className="text-xs text-muted-2 mt-4">free forever · no spam · the prompts stay free</p>
        </div>
      </div>
    </section>
  );
}
