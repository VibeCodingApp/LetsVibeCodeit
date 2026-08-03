export function WhatYouLose({ items }: { items: string[] }) {
  return (
    <div>
      <h3 className="font-display text-lg font-bold mb-3">What you lose</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 p-3 rounded-lg text-sm" style={{ background: 'var(--lose-bg)', border: '1px solid var(--lose-border)' }}>
            <span className="text-danger mt-0.5 shrink-0 text-base leading-none">✕</span>
            <span className="text-fg-2">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
