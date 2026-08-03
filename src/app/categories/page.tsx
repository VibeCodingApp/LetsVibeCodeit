import { getAllApps, getCategoryCounts } from '@/lib/apps';
import { categoryEmoji, categoryLabel } from '@/lib/constants';

export const dynamic = 'force-static';

export default function CategoriesPage() {
  const counts = getCategoryCounts();
  const total = getAllApps().length;

  return (
    <div className="container-main py-10 md:py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Categories</h1>
      <p className="text-muted text-sm mb-8">{total} apps across {counts.length} categories</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {counts.map(c => (
          <a key={c.cat} href={`/category/${c.cat}`} className="block p-4 rounded-xl border border-[var(--border)] bg-surface-2 hover:bg-surface-3 hover:-translate-y-0.5 transition-all no-underline group">
            <div className="font-semibold font-display text-fg group-hover:text-primary transition-colors flex items-center gap-2">
              <span aria-hidden="true">{categoryEmoji(c.cat)}</span>{categoryLabel(c.cat)}
            </div>
            <div className="text-xs text-muted mt-1">{c.count} app{c.count !== 1 ? 's' : ''}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
