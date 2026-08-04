import type { Metadata } from 'next';
import { SponsorCheckout } from '@/components/sponsor-checkout';
import { getAvailableSlots } from '@/lib/sponsors';
import { SPONSOR_PLANS, type SponsorPlan } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sponsor',
  description: 'Transparent, fixed-price sponsorship for LetsVibeCodeit.com — labeled placements in the rails, in-list ads, and the weekly digest.',
  alternates: { canonical: '/sponsor' },
  robots: { index: true, follow: true },
};

const slots = [
  {
    name: 'Fixed side rail',
    price: '$199',
    cadence: '30 days',
    inventory: '14 fixed positions',
    size: '216px wide x 1/7 of the viewport height',
    detail: 'L1-L7 and R1-R7. Your sponsor stays in the same position for the full reservation. It is never rotated out.',
  },
  {
    name: 'Hero vertical',
    price: '$49',
    cadence: '30 days',
    inventory: '2 positions',
    size: '200 x 360px',
    detail: 'One left and one right of the hero when the viewport has enough room. The creative is part of the rotating sponsor pool.',
  },
  {
    name: 'In-list placement',
    price: '$79',
    cadence: '30 days',
    inventory: 'Rotating inventory',
    size: 'Content width x approx. 100-120px',
    detail: 'A labeled placement between app groups. The sticky layer shows one active sponsor at a time beneath the header.',
  },
  {
    name: 'Weekly digest',
    price: '$25',
    cadence: '30 days',
    inventory: 'Up to 4 weekly sends',
    size: 'Email-native, up to 600px wide',
    detail: 'A labeled sponsor placement inside the weekly email with tips, verdicts, and practical content for vibecoders.',
  },
];

const rules = [
   'Every reservation lasts 30 days and does not renew automatically.',
   'A paid slot becomes active after the claim form is submitted and the creative is stored in our sponsor database.',
   'Expired slots return to the available inventory automatically.',
   'We label every sponsor clearly and never mix sponsor copy with verdicts, rankings, or editorial decisions.',
];

export default async function SponsorPage() {
  const planOrder: SponsorPlan[] = ['rail', 'hero', 'inList', 'digest'];
  const plans = await Promise.all(planOrder.map(async id => ({
    id,
    label: SPONSOR_PLANS[id].label,
    amount: SPONSOR_PLANS[id].amount,
    slots: await getAvailableSlots(id),
  })));

  return (
    <div className="container-main py-12 md:py-20">
      <header className="max-w-[760px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">Sponsor / transparent media</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">Promote your product without the mystery.</h1>
        <p className="mt-5 text-base leading-relaxed text-muted md:text-lg">
          LetsVibeCodeit is visited by developers, founders, and curious builders deciding what to keep and what to replace. Marketing here is for everyone: clear prices, short reservations, no sales call, and no inflated media kit theater.
        </p>
      </header>

      <section className="mt-12 border-y border-[var(--border)] py-7">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="font-display text-xl font-bold text-primary">No hidden tiers.</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">The price on this page is the price for the placement. There are no mysterious minimums or surprise platform fees.</p>
          </div>
          <div>
            <p className="font-display text-xl font-bold text-primary">Marketing for everyone.</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">A small product deserves a fair chance too. We keep the inventory compact and the rates human-sized.</p>
          </div>
          <div>
            <p className="font-display text-xl font-bold text-primary">Availability is the only limit.</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">We cannot guarantee an open position. Reserve early if a specific rail, hero position, or month matters to you.</p>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">The menu</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Four ways to be seen.</h2>
          </div>
          <p className="font-mono text-xs text-muted-2">All prices USD / 30-day reservation</p>
        </div>

        <div className="mt-7 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {slots.map(slot => (
            <article key={slot.name} className="grid gap-4 py-6 md:grid-cols-[1.1fr_.7fr_1.5fr] md:items-start">
              <div>
                <p className="font-display text-xl font-bold">{slot.name}</p>
                <p className="mt-1 font-mono text-xs text-muted-2">{slot.inventory}</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-primary">{slot.price}</p>
                <p className="font-mono text-xs text-muted-2">/ {slot.cadence}</p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">Recommended size</p>
                <p className="mt-1 text-sm text-fg-2">{slot.size}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{slot.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">Fixed vs rotating</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Same site, two visibility models.</h2>
          <div className="mt-6 space-y-6">
             <div>
               <h3 className="font-display text-lg font-bold">L and R rails stay fixed.</h3>
               <p className="mt-2 text-sm leading-relaxed text-muted">On desktop, the 14 L1-L7 and R1-R7 positions are fixed at the sides of the page. On mobile, those same positions become the top and bottom marquee, preserving the rail inventory in a format that fits a narrow screen. This audience is developer-heavy and primarily browses from desktop, so the fixed PC rails are the main visibility product.</p>
             </div>
             <div>
               <h3 className="font-display text-lg font-bold">Everything else rotates fairly.</h3>
               <p className="mt-2 text-sm leading-relaxed text-muted">Hero and in-list placements use one shared rotating pool across every eligible page and slot. Every anonymous visitor sees the same pool cycle through its sponsors; with fewer sponsors, each one appears more often. The rotation uses equal turns, so available impressions are divided by the number of active sponsors rather than favoring one buyer.</p>
            </div>
          </div>
        </div>
        <div className="border-y border-[var(--border)] py-6 lg:border-y-0 lg:border-l lg:pl-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">Why rotation works</p>
           <p className="mt-3 text-sm leading-relaxed text-muted">A visitor may open one app detail, browse a category, compare a moat, and return to the vibecoded list. Each page and each rotating slot joins the same eligible pool, so sponsors can be seen throughout the anonymous browsing journey instead of being trapped on one URL.</p>
           <p className="mt-4 text-sm leading-relaxed text-muted">The client rotates the active sponsor on a short, equal interval and uses the same rule across all rotating locations. We do not promise a fixed impression count because traffic changes; we do promise that the pool is shared fairly and that fewer active sponsors means more frequent turns.</p>
        </div>
      </section>

      <section className="mt-14 border-y border-[var(--border)] py-8">
        <div className="grid gap-8 md:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">The weekly digest</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">A useful email, not an ad blast.</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted">The digest goes to people who signed up for weekly tips, new verdicts, and practical content for vibecoders. Digest sponsors appear as a clearly labeled native placement inside those emails. The $25 reservation covers up to four weekly sends during the 30-day window.</p>
        </div>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">Simple terms</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Reserve with confidence.</h2>
          <ul className="mt-5 space-y-3">
            {rules.map(rule => <li key={rule} className="flex gap-3 text-sm leading-relaxed text-muted"><span className="text-primary">+</span><span>{rule}</span></li>)}
          </ul>
        </div>
        <div className="flex flex-col justify-between border border-[var(--border)] p-6">
          <div>
             <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-2">Renewal policy</p>
             <p className="mt-3 font-display text-4xl font-bold text-primary">One and done</p>
             <p className="mt-2 text-sm leading-relaxed text-muted">Every sponsorship is a single 30-day payment. There is no automatic renewal, surprise charge, or recurring subscription.</p>
          </div>
          <a href="#availability" className="mt-7 inline-flex w-fit items-center gap-2 border-b border-primary pb-1 font-mono text-sm text-primary no-underline">Check availability -&gt;</a>
        </div>
      </section>

      <section id="availability" className="mt-14 border-t border-[var(--border)] pt-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">Next step</p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Tell us what you want to promote.</h2>
          <p className="mt-3 max-w-[760px] text-sm leading-relaxed text-muted">Choose an available placement and pay securely with Stripe. After payment, you will be redirected to upload a full banner or an icon with text, name, and the click destination URL. The slot activates after that form is submitted.</p>
          <SponsorCheckout plans={plans} />
          <p className="mt-3 font-mono text-xs text-primary">L1 is reserved as the free test slot. All other placements go through paid Stripe Checkout.</p>
         <p className="mt-4 font-mono text-xs text-muted-2">Payment is one-time for 30 days. No automatic renewal. Expired slots return to this inventory automatically.</p>
      </section>
    </div>
  );
}
