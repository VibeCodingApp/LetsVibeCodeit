import type { PriorArtEntry } from '@/lib/types';

export function PriorArt({ items }: { items: PriorArtEntry[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="font-display text-lg font-bold mb-3">Prior art / alternatives</h3>
      <div className="grid gap-2">
        {items.map((p, i) => (
          <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="block p-3.5 rounded-lg border border-[var(--border)] bg-surface-2 hover:bg-surface-3 transition-colors no-underline group">
            <div className="font-semibold font-display text-fg group-hover:text-primary transition-colors text-sm">{p.name}</div>
            <div className="text-xs text-muted mt-0.5">{p.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
