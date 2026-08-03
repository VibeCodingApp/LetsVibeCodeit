'use client';
import { CATEGORY_EMOJI } from '@/lib/constants';

export function CategoryChips({ categories, active, onChange }: { categories: string[]; active: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-[700px] mx-auto">
      {categories.map(c => {
        const emoji = CATEGORY_EMOJI[c] || '';
        return (
          <button key={c} onClick={() => onChange(c)} className={`chip ${active === c ? 'chip-active' : ''}`}>
            {emoji && <span className="mr-1">{emoji}</span>}{c === 'all' ? 'all' : c}
          </button>
        );
      })}
    </div>
  );
}
