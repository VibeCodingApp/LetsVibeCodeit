import { notFound } from 'next/navigation';
import { getAppsByCategory, getAllApps } from '@/lib/apps';
import { categoryEmoji, categoryLabel } from '@/lib/constants';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const cats = new Set(getAllApps().map(a => a.category));
  return Array.from(cats).map(cat => ({ cat }));
}

export async function generateMetadata({ params }: { params: { cat: string } }): Promise<Metadata> {
  return { title: `${categoryLabel(params.cat)} · LetsVibeCodeit` };
}

export default function CategoryPage({ params }: { params: { cat: string } }) {
  const apps = getAppsByCategory(params.cat);
  if (!apps.length) notFound();

  return (
    <div className="container-main py-10 md:py-12">
      <a href="/categories" className="text-xs text-muted hover:text-fg no-underline font-mono transition-colors">← All categories</a>
      <h1 className="font-display text-3xl md:text-4xl font-bold mt-3 mb-1 flex items-center gap-3 capitalize">
        <span aria-hidden="true">{categoryEmoji(params.cat)}</span>{categoryLabel(params.cat)}
      </h1>
      <p className="text-muted text-sm mb-8">{apps.length} app{apps.length !== 1 ? 's' : ''}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {apps.map(a => (
          <a key={a.slug} href={`/${a.slug}`} className="block p-4 rounded-xl border border-[var(--border)] bg-surface-2 hover:bg-surface-3 hover:-translate-y-0.5 transition-all no-underline group">
            <div className="font-semibold font-display text-fg group-hover:text-primary transition-colors mb-1">{a.name}</div>
            <div className="text-xs text-muted mb-2">{a.tagline}</div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold ${a.verdict === 'yes' ? 'bg-[var(--yes-bg)] text-[var(--yes-fg)]' : a.verdict === 'kinda' ? 'bg-[var(--kinda-bg)] text-[var(--kinda-fg)]' : 'bg-[var(--no-bg)] text-[var(--no-fg)]'}`}>
              {a.verdict === 'yes' ? 'YES' : a.verdict === 'kinda' ? 'KINDA' : 'NOT REALLY'}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
