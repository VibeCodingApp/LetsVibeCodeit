export const dynamic = 'force-static';

export default function SponsorPage() {
  const tiers = [
    { name: 'Side Rail Slot', price: '$199', dur: '30 days', desc: '7 fixed slots per side. Always visible, never scrolls. Left and right rails at 2xl+. Most premium placement.', spots: '14 spots total' },
    { name: 'Hero Banner', price: '$99', dur: '30 days', desc: 'Vertical 3:1 slot flanking the hero. One on each side. Seen by every visitor above the fold.', spots: '2 spots total' },
    { name: 'In-List Ad', price: '$99', dur: '30 days', desc: 'Appears every 10 rows in the death list. Native placement where readers are most engaged.', spots: 'Unlimited' },
    { name: 'Digest Sponsor', price: '$99', dur: 'per edition', desc: 'Featured in the weekly verdict digest email. One sponsor per edition. Reaches inboxes directly.', spots: '1 per edition' },
  ];

  return (
    <div className="container-main py-10 md:py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Sponsor LetsVibeCodeit.com</h1>
      <p className="text-muted text-sm mb-10 max-w-[640px]">Reach 50K+ monthly developers who are actively replacing SaaS subscriptions. Your product, right where they&apos;re looking for alternatives.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {tiers.map(t => (
          <div key={t.name} className="border border-[var(--border)] rounded-xl p-6 flex flex-col">
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-2 font-mono mb-1">{t.spots}</div>
            <h3 className="font-display font-bold text-lg mb-1">{t.name}</h3>
            <div className="font-display text-3xl font-bold text-primary mb-1">{t.price}<span className="text-xs text-muted-2 font-mono font-normal">/{t.dur}</span></div>
            <p className="text-xs text-muted-2 leading-relaxed mt-2 flex-1">{t.desc}</p>
          </div>
        ))}
      </div>

      <div className="border border-[var(--border)] rounded-xl p-8 text-center max-w-[500px] mx-auto">
        <h3 className="font-display font-bold text-lg mb-2">Ready to get listed?</h3>
        <p className="text-muted text-sm mb-5">Slots are first-come, first-served. Reach out and we&apos;ll get you set up.</p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-[400px] mx-auto">
          <input type="email" placeholder="you@company.com" required className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] bg-surface text-fg font-mono text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-2" />
          <button type="submit" className="px-6 py-3 rounded-lg bg-primary text-black font-display font-semibold text-sm hover:brightness-110 hover:-translate-y-0.5 transition-all whitespace-nowrap">Get notified</button>
        </form>
      </div>
    </div>
  );
}
