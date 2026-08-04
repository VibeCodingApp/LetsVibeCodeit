'use client';

import { useState } from 'react';
import { SponsorPurchaseButton } from './sponsor-purchase-button';

type PlanId = 'rail' | 'hero' | 'inList' | 'digest';
type Slot = { id: string; label: string; occupied?: { name: string; expiresAt: number } };
type Plan = { id: PlanId; label: string; amount: number; slots: Slot[] };

export function SponsorCheckout({ plans }: { plans: Plan[] }) {
  const [planId, setPlanId] = useState<PlanId>('rail');
  const selected = plans.find(plan => plan.id === planId) || plans[0];

  function changePlan(value: PlanId) {
    setPlanId(value);
  }

  return (
    <div className="mt-7 border border-[var(--border)] bg-surface-2 p-5 md:p-6">
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-2">Placement</span>
        <select value={planId} onChange={event => changePlan(event.target.value as PlanId)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-surface-3 px-3 py-3 font-mono text-sm text-fg outline-none focus:border-primary">
          {plans.map(plan => <option key={plan.id} value={plan.id}>{plan.label} · ${(plan.amount / 100).toFixed(0)} / 30 days</option>)}
        </select>
      </label>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {selected?.slots.map(slot => slot.occupied ? <div key={slot.id} className="flex items-center justify-between gap-3 rounded-lg border border-warning/40 bg-surface-3 px-4 py-3 text-left"><span><span className="block font-mono text-sm text-fg">{slot.label}</span><span className="mt-1 block font-mono text-[11px] text-warning">Occupied · {slot.occupied.name}</span></span><span className="text-right font-mono text-[10px] text-muted-2">expires<br />{formatDate(slot.occupied.expiresAt)}</span></div> : <SponsorPurchaseButton key={slot.id} plan={selected.id} slotId={slot.id} ariaLabel={`${slot.id === 'left-1' ? 'Open free test slot' : 'Pay for'} ${slot.label}`} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-surface-3 px-4 py-3 text-left transition-colors hover:border-primary"><span className="font-mono text-sm text-fg">{slot.label}</span><span className="font-display text-sm font-bold text-primary">{slot.id === 'left-1' ? 'Free test →' : `$${(selected.amount / 100).toFixed(0)} →`}</span></SponsorPurchaseButton>)}
      </div>
      {!selected?.slots.length && <p className="mt-4 font-mono text-xs text-muted-2">No slots are currently available for this placement.</p>}
    </div>
  );
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
