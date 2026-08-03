import { getAllApps } from '@/lib/apps';
import { MOAT_TAGS } from '@/lib/constants';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Moats',
  description: 'The moats that keep SaaS subscriptions alive — network effects, integrations, trust, and ecosystems, one tag at a time.',
  alternates: { canonical: '/moats' },
};

export default function MoatsPage() {
  const apps = getAllApps();
  const counts = new Map<string, number>();
  apps.forEach(a => a.moatTags.forEach(t => counts.set(t, (counts.get(t) || 0) + 1)));
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="container-main py-10 md:py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Moats</h1>
      <p className="text-muted text-sm mb-8">What actually protects these apps from being replaced. 13 moat tags across {apps.length} apps.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map(([tag, count]) => (
          <a key={tag} href={`/moat/${tag}`} className="block p-4 rounded-xl border border-[var(--border)] bg-surface-2 hover:bg-surface-3 hover:-translate-y-0.5 transition-all no-underline group">
            <div className="font-semibold font-display text-fg group-hover:text-primary transition-colors">{MOAT_TAGS[tag] || tag}</div>
            <div className="text-xs text-muted mt-1">{count} app{count !== 1 ? 's' : ''}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
