'use client';

import { useState } from 'react';

type PlanId = 'rail' | 'hero' | 'inList' | 'digest';
type Slot = { id: string; label: string };
type Plan = { id: PlanId; label: string; amount: number; slots: Slot[] };

export function SponsorCheckout({ plans }: { plans: Plan[] }) {
  const [planId, setPlanId] = useState<PlanId>('rail');
  const [slotId, setSlotId] = useState(plans.find(plan => plan.id === 'rail')?.slots[0]?.id || '');
  const [status, setStatus] = useState<'idle' | 'busy' | 'error'>('idle');
  const selected = plans.find(plan => plan.id === planId) || plans[0];

  function changePlan(value: PlanId) {
    setPlanId(value);
    setSlotId(plans.find(plan => plan.id === value)?.slots[0]?.id || '');
    setStatus('idle');
  }

  async function checkout() {
    if (!selected || !slotId || status === 'busy') return;
    setStatus('busy');
    try {
      const response = await fetch('/api/sponsor/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, slotId }),
      });
      const data = await response.json();
      if (!response.ok || !data.checkoutUrl) throw new Error('checkout_failed');
      window.location.assign(data.checkoutUrl);
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="mt-7 grid gap-5 border border-[var(--border)] bg-surface-2 p-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-2">Placement</span>
        <select value={planId} onChange={event => changePlan(event.target.value as PlanId)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-surface-3 px-3 py-3 font-mono text-sm text-fg outline-none focus:border-primary">
          {plans.map(plan => <option key={plan.id} value={plan.id}>{plan.label} · ${(plan.amount / 100).toFixed(0)} / 30 days</option>)}
        </select>
      </label>
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-2">Slot</span>
        <select value={slotId} onChange={event => setSlotId(event.target.value)} disabled={!selected?.slots.length} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-surface-3 px-3 py-3 font-mono text-sm text-fg outline-none focus:border-primary disabled:opacity-50">
          {selected?.slots.map(slot => <option key={slot.id} value={slot.id}>{slot.label}</option>)}
        </select>
      </label>
      <button type="button" onClick={checkout} disabled={!slotId || status === 'busy'} className="rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold text-black transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">{status === 'busy' ? 'Opening checkout...' : 'Pay securely →'}</button>
      {status === 'error' && <p className="md:col-span-3 font-mono text-xs text-danger">That slot may have just been taken. Refresh and try again.</p>}
    </div>
  );
}
