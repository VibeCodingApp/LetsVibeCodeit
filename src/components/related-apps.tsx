import type { AppData } from '@/lib/types';
import { VerdictBadge } from './verdict-badge';

function appColor(n: string) { const c=['#33e667','#8775ff','#ffb000','#ff5c5c','#3bc0db','#f97316','#ec4899','#14b8a6','#f43f5e']; let h=0; for(let i=0;i<n.length;i++)h=(h<<5)-h+n.charCodeAt(i); return c[Math.abs(h)%c.length]; }

export function RelatedApps({ apps }: { apps: AppData[] }) {
  if (!apps.length) return null;
  return (
    <div>
      <h3 className="font-display text-lg font-bold mb-3">Related apps</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {apps.map(a => (
          <a key={a.slug} href={`/${a.slug}`} className="block p-4 rounded-xl border border-[var(--border)] bg-surface-2 hover:bg-surface-3 transition-all hover:-translate-y-0.5 no-underline group">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-display shrink-0 border" style={{background:`${appColor(a.name)}18`,color:appColor(a.name),borderColor:`${appColor(a.name)}40`}}>{a.name.charAt(0)}</span>
              <div>
                <div className="font-semibold font-display text-fg group-hover:text-primary transition-colors text-sm">{a.name}</div>
                <div className="text-[11px] text-muted">{a.category}</div>
              </div>
            </div>
            <VerdictBadge verdict={a.verdict} />
          </a>
        ))}
      </div>
    </div>
  );
}
