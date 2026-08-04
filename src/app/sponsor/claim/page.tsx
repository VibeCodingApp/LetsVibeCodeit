import type { Metadata } from 'next';
import { retrieveCheckoutSession } from '@/lib/stripe';
import { SponsorClaimForm } from '@/components/sponsor-claim-form';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Claim sponsorship', robots: { index: false, follow: false } };

export default async function SponsorClaimPage({ searchParams }: { searchParams: { session_id?: string } }) {
  const sessionId = searchParams.session_id || '';
  if (!sessionId) return <ClaimMessage title="Missing payment session" copy="Return to the sponsor page and start checkout again." />;

  try {
    const session = await retrieveCheckoutSession(sessionId);
    if (session.status !== 'complete' || session.payment_status !== 'paid') return <ClaimMessage title="Payment not confirmed yet" copy="Stripe has not marked this checkout as paid. Refresh this page after payment completes." />;
    if (session.metadata.claimed === 'true') return <ClaimMessage title="Sponsorship already claimed" copy="This payment session has already been activated. Check your confirmation email for the expiration date." />;
    return (
      <div className="container-main py-12 md:py-20">
        <div className="mx-auto max-w-[680px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">Payment confirmed</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">Make your slot yours.</h1>
          <p className="mt-5 text-base leading-relaxed text-muted">Add the creative that will appear in your paid sponsorship. It runs for 30 days and does not renew automatically.</p>
          <div className="mt-8"><SponsorClaimForm sessionId={sessionId} plan={session.metadata.plan || 'sponsorship'} slot={session.metadata.slotId || 'assigned slot'} /></div>
        </div>
      </div>
    );
  } catch {
    return <ClaimMessage title="Could not verify payment" copy="The session may be invalid or Stripe is temporarily unavailable. Contact us if you were charged." />;
  }
}

function ClaimMessage({ title, copy }: { title: string; copy: string }) {
  return <div className="container-main py-20"><div className="mx-auto max-w-[680px] border border-[var(--border)] bg-surface-2 p-7"><h1 className="font-display text-3xl font-bold">{title}</h1><p className="mt-3 text-sm leading-relaxed text-muted">{copy}</p><a href="/sponsor" className="mt-6 inline-flex border-b border-primary pb-1 font-mono text-sm text-primary no-underline">Back to sponsorships →</a></div></div>;
}
