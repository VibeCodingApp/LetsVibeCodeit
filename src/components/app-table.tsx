'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { AppRow, FilterState } from '@/lib/types';
import { INITIAL_FILTER, AD_INTERVAL } from '@/lib/constants';
import { filterApps } from '@/lib/filter-apps';
import { AppRow as AppRowC } from './app-row';
import { CategoryChips } from './category-chips';
import { AdSlot, StickyAdLayer, useStickyAdIndex } from './ad-slot';

function TableHead() {
  return (
    <thead>
      <tr>
        <th className="text-left py-2.5 pr-4 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-2 border-b-2 border-[var(--border)] w-8">#</th>
        <th className="text-left py-2.5 pr-4 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-2 border-b-2 border-[var(--border)] w-[38%]">app</th>
        <th className="text-left py-2.5 pr-4 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-2 border-b-2 border-[var(--border)] w-[22%]">category</th>
        <th className="text-left py-2.5 pr-4 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-2 border-b-2 border-[var(--border)] w-[14%]">price</th>
        <th className="text-left py-2.5 pr-4 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-2 border-b-2 border-[var(--border)] w-[16%]">verdict</th>
        <th className="text-left py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-2 border-b-2 border-[var(--border)]">replaced it</th>
      </tr>
    </thead>
  );
}

const PAGE_SIZE = 60;

export function AppTable({ initialRows, categories }: { initialRows: AppRow[]; categories: string[] }) {
  const [rows, setRows] = useState(initialRows);
  const [f, setF] = useState<FilterState>(INITIAL_FILTER);
  const [activeAdIndex, setActiveAdIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let alive = true;
    fetch('/api/rows')
      .then(r => (r.ok ? r.json() : null))
      .then((all: AppRow[] | null) => { if (alive && all && all.length) setRows(all); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => filterApps(rows, f), [rows, f]);
  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const listRef = useRef<HTMLElement>(null);

  const chunks: AppRow[][] = [];
  for (let i = 0; i < visible.length; i += AD_INTERVAL) {
    chunks.push(visible.slice(i, i + AD_INTERVAL));
  }

  const adSlots = chunks.slice(0, -1).map((_, index) => 'in-table-' + index);
  const activeAdSlot = activeAdIndex === null ? null : adSlots[activeAdIndex] ?? null;

  useStickyAdIndex(listRef, adSlots.length, setActiveAdIndex);

  useEffect(() => {
    setActiveAdIndex(null);
    setVisibleCount(PAGE_SIZE);
  }, [filtered]);

  return (
    <section ref={listRef} className="section-pad" data-in-list-root>
      <div className="container-main">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-primary font-mono">The Vibecoded List</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-1">ranked by &ldquo;I replaced this&rdquo; votes</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-mono">sort:</span>
            <select value={f.sort} onChange={e => setF({ ...f, sort: e.target.value as FilterState['sort'] })}
              className="px-3 py-1.5 rounded-lg text-fg font-mono text-xs cursor-pointer outline-none bg-transparent border border-[var(--border)] hover:border-[var(--border-2)] transition-colors">
              <option value="votes">votes ↓</option><option value="name">name A–Z</option><option value="price">price: low→high</option>
            </select>
          </div>
        </div>

        <div className="mb-5">
          <CategoryChips categories={categories} active={f.category} onChange={c => setF({ ...f, category: c, search: '' })} />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          {(['all', 'yes', 'kinda', 'no'] as const).map(v => {
            const ac = f.verdict === v
              ? v === 'yes' ? 'chip-active'
                : v === 'kinda' ? 'bg-[var(--kinda-bg)] !text-[var(--kinda-fg)] !border-[var(--warning)] font-semibold'
                : v === 'no' ? 'bg-[var(--no-bg)] !text-[var(--no-fg)] !border-[var(--danger)] font-semibold'
                : 'chip-active'
              : '';
            return <button key={v} onClick={() => setF({ ...f, verdict: v })} className={['chip', ac].filter(Boolean).join(' ')}>{v === 'all' ? 'ALL' : v === 'yes' ? 'YES' : v === 'kinda' ? 'KINDA' : 'NOT REALLY'}</button>;
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm border-b border-[var(--border)]">
            No apps found. <a href="#" className="text-primary no-underline hover:underline">Submit it as a PR →</a>
          </div>
        ) : (
          <>
            <StickyAdLayer slot={activeAdSlot} />
            <div>
              {chunks.map((chunk, ci) => {
                const offset = ci * AD_INTERVAL;
                return (
                  <div key={ci}>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        {ci === 0 && <TableHead />}
                        <tbody>
                          {chunk.map((a, i) => (
                            <AppRowC key={a.slug} app={a} rank={offset + i + 1} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {ci < chunks.length - 1 && (
                      <AdSlot
                        slot={adSlots[ci]}
                        anchorIndex={ci}
                        isActive={activeAdIndex === ci}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <p className="text-center mt-6 text-xs text-muted-2">verdicts are added daily · thousands more on the way</p>

        {visible.length < filtered.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
              className="chip chip-active px-6 py-2.5 text-sm"
            >
              load {Math.min(PAGE_SIZE, filtered.length - visible.length)} more · {filtered.length - visible.length} left
            </button>
          </div>
        )}
      </div>
    </section>
  );
}