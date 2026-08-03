import type { Verdict } from '@/lib/types';

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const s: Record<Verdict, { bg: string; fg: string; label: string }> = {
    yes: { bg: 'var(--yes-bg)', fg: 'var(--yes-fg)', label: 'YES' },
    kinda: { bg: 'var(--kinda-bg)', fg: 'var(--kinda-fg)', label: 'KINDA' },
    no: { bg: 'var(--no-bg)', fg: 'var(--no-fg)', label: 'NOT REALLY' },
  };
  const v = s[verdict];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold tracking-[0.02em] ${verdict === 'yes' ? 'animate-[badgePop_.3s_cubic-bezier(.34,1.56,.64,1)] animate-pulse-glow' : ''}`}
      style={{ background: v.bg, color: v.fg }}>
      {v.label}
    </span>
  );
}
