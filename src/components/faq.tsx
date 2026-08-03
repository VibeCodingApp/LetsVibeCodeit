'use client';
import { useState } from 'react';

export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-0 border border-[var(--border)] rounded-xl overflow-hidden divide-y divide-[var(--border)]">
      {items.map((item, i) => (
        <div key={i} className="bg-surface-2">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left font-display font-semibold text-fg hover:text-primary transition-colors text-sm">
            {item.q}
            <span className={`text-muted transition-transform text-lg ${open === i ? 'rotate-45' : ''}`}>+</span>
          </button>
          {open === i && <div className="px-5 pb-4 text-sm text-muted leading-relaxed">{item.a}</div>}
        </div>
      ))}
    </div>
  );
}
