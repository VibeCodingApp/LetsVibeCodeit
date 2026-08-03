import type { AppRow, Verdict } from '@/lib/types';
import { VerdictBadge } from './verdict-badge';

export function AppRow({ app, rank }: { app: AppRow; rank: number }) {
  const p = app.priceMonthly === null ? '—' : app.priceMonthly === 0 ? 'Free' : `$${app.priceMonthly}/mo`;
  return (
    <tr className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors group">
      <td className="py-3.5 pr-4 text-muted text-xs font-mono w-8">{rank}</td>
      <td className="py-3.5 pr-4">
        <a href={`/${app.slug}`} className="flex items-center gap-3 no-underline">
          <img src={`https://www.google.com/s2/favicons?domain=${app.domain}&sz=64`} alt={`${app.name} icon`} width={20} height={20} className="w-5 h-5 rounded shrink-0" loading="lazy" />
          <span className="font-semibold font-display text-fg group-hover:text-primary transition-colors">{app.name}</span>
        </a>
      </td>
      <td className="py-3.5 pr-4 text-muted text-[13px] whitespace-nowrap">{app.category}</td>
      <td className="py-3.5 pr-4 font-mono text-[13px] whitespace-nowrap">{p}</td>
      <td className="py-3.5 pr-4 whitespace-nowrap"><VerdictBadge verdict={app.verdict as Verdict} /></td>
      <td className="py-3.5 font-mono text-[13px] font-medium whitespace-nowrap"><strong className="text-primary">{app.votes}</strong> votes</td>
    </tr>
  );
}