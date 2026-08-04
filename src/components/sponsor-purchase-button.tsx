'use client';

import { useState } from 'react';

export function SponsorPurchaseButton({ plan, slotId, children, className = '', ariaLabel, style, labelled = true }: {
  plan: 'rail' | 'hero' | 'inList' | 'digest';
  slotId: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  style?: React.CSSProperties;
  labelled?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  async function startCheckout() {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch('/api/sponsor/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, slotId }),
      });
      const data = await response.json();
      if (!response.ok || !data.checkoutUrl) throw new Error('checkout_failed');
      window.location.assign(data.checkoutUrl);
    } catch {
      setBusy(false);
    }
  }

  return <button type="button" onClick={startCheckout} disabled={busy} aria-hidden={!labelled} tabIndex={labelled ? 0 : -1} aria-label={ariaLabel} style={style} className={`${className} disabled:cursor-wait disabled:opacity-60`}>{busy ? 'Opening checkout...' : children}</button>;
}
