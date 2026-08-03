import type { AppData } from '@/lib/types';
import { VerdictBadge } from './verdict-badge';
import { categoryLabel } from '@/lib/constants';

export function RelatedApps({ apps }: { apps: AppData[] }) {
  if (!apps.length) return null;
  return (
    <div>
      <h3 className="font-display text-lg font-bold mb-3">Related apps</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {apps.map(a => (
          <a key={a.slug} href={`/${a.slug}`} className="block p-4 rounded-xl border border-[var(--border)] bg-surface-2 hover:bg-surface-3 transition-all hover:-translate-y-0.5 no-underline group">
            <div className="flex items-center gap-2 mb-2">
              <img src={`https://www.google.com/s2/favicons?domain=${a.domain}&sz=64`} alt={`${a.name} icon`} width={32} height={32} className="w-8 h-8 shrink-0 rounded-lg border border-[var(--border)] bg-surface-3 p-1" loading="lazy" />
              <div>
                <div className="font-semibold font-display text-fg group-hover:text-primary transition-colors text-sm">{a.name}</div>
                <div className="text-[11px] text-muted">{categoryLabel(a.category)}</div>
              </div>
            </div>
            <VerdictBadge verdict={a.verdict} />
          </a>
        ))}
      </div>
    </div>
  );
}
