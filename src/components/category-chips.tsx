'use client';
import { categoryEmoji, categoryLabel } from '@/lib/constants';

export function CategoryChips({ categories, active, onChange }: { categories: string[]; active: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-[760px] mx-auto">
      {categories.map(c => {
        const emoji = categoryEmoji(c);
        return (
          <button key={c} onClick={() => onChange(c)} className={`chip inline-flex items-center gap-1.5 ${active === c ? 'chip-active' : ''}`}>
            {emoji && <span aria-hidden="true">{emoji}</span>}{categoryLabel(c)}
          </button>
        );
      })}
    </div>
  );
}
