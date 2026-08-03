import { notFound } from 'next/navigation';
import { getAppsByMoat, getAllApps } from '@/lib/apps';
import { MOAT_TAGS } from '@/lib/constants';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const tags = new Set<string>();
  getAllApps().forEach(a => a.moatTags.forEach(t => tags.add(t)));
  return Array.from(tags).map(tag => ({ tag }));
}

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const label = MOAT_TAGS[params.tag] || params.tag;
  const apps = getAppsByMoat(params.tag);
  if (!apps.length) return { title: 'Not Found' };
  return {
    title: label,
    description: `${apps.length} apps defended by ${label} — why their moat survives a focused build.`,
    alternates: { canonical: `/moat/${params.tag}` },
    openGraph: { title: label, description: `${apps.length} apps where ${label} keeps the original alive` },
  };
}

export default function MoatPage({ params }: { params: { tag: string } }) {
  const apps = getAppsByMoat(params.tag);
  if (!apps.length) notFound();
  const label = MOAT_TAGS[params.tag] || params.tag;

  return (
    <div className="container-main py-10 md:py-12">
      <a href="/moats" className="text-xs text-muted hover:text-fg no-underline font-mono transition-colors">← All moats</a>
      <h1 className="font-display text-3xl md:text-4xl font-bold mt-3 mb-1">{label}</h1>
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
