'use client';
import { useState } from 'react';
import { useTheme } from './theme-provider';

const links = [
  { href: '/', label: 'Death List' },
  { href: '/categories', label: 'Categories' },
  { href: '/stats', label: 'Stats' },
  { href: '/sponsor', label: 'Sponsor' },
];

export function Header() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      <header data-site-header className="sticky top-0 z-50 bg-transparent">
        <div className="max-w-[1120px] 2xl:max-w-[960px] mx-auto glass px-5 h-[54px] flex items-center justify-between rounded-b-xl">
          <a href="/" className="flex items-center no-underline text-fg group shrink-0 gap-2.5">
            <span className="w-7 h-7 rounded-md bg-[#1a2a1f] border border-[#2a4a2f] text-primary flex items-center justify-center font-mono text-[12px] font-bold group-hover:border-primary group-hover:shadow-[0_0_12px_var(--primary-glow)] transition-all duration-300">&lt;/&gt;</span>
            <span className="font-display font-bold text-[17px] tracking-tight whitespace-nowrap leading-none">
              <span className="text-primary">Lets</span>VibeCode<span className="text-primary">it</span>
              <span className="text-primary text-[9px] align-super ml-0.5 opacity-80">.com</span>
            </span>
          </a>

          <button
            className="md:hidden flex items-center justify-center w-8 h-8 text-fg text-lg bg-none border-0 cursor-pointer"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? '✕' : '☰'}
          </button>

          <nav className="hidden md:flex items-center gap-0.5">
            {links.map(l => (
              <a key={l.href} href={l.href} className="group relative no-underline text-muted hover:text-fg px-3 py-2 font-mono text-[12.5px] tracking-[0.01em] transition-colors duration-200">
                {l.label}
                <span className="absolute bottom-1.5 left-3 right-3 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>
            ))}
            <a href="https://github.com/canivibecodeit/canivibecodeit" target="_blank" rel="noopener noreferrer" className="ml-1 relative no-underline inline-flex items-center gap-1.5 px-3 py-2 font-mono text-[12.5px] text-muted hover:text-fg transition-colors duration-200">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              GitHub
            </a>
          </nav>

          <button onClick={toggle} className="w-8 h-8 cursor-pointer flex items-center justify-center text-sm transition-colors duration-200 shrink-0 ml-2 text-muted hover:text-fg bg-transparent border-0" aria-label="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {open && (
          <nav className="md:hidden absolute top-[54px] left-0 right-0 bg-[var(--surface)] border-b border-[var(--border)] p-4 flex flex-col gap-0.5 z-50 shadow-[0_8px_24px_rgba(0,0,0,.5)]">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="no-underline text-fg-2 hover:text-fg px-3 py-2.5 font-mono text-sm transition-colors border-b border-[var(--border)] last:border-b-0">
                {l.label}
              </a>
            ))}
            <a href="https://github.com/canivibecodeit/canivibecodeit" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="no-underline inline-flex items-center gap-2 px-3 py-2.5 font-mono text-sm text-fg-2 hover:text-fg transition-colors">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              GitHub
            </a>
          </nav>
        )}
      </header>
    </>
  );
}
