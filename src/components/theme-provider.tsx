'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
const Ctx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => {} });
export function useTheme() { return useContext(Ctx); }

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const s = localStorage.getItem('theme') as Theme | null;
    const t = s || 'dark';
    setTheme(t);
    document.documentElement.className = t === 'light' ? 'light' : '';
    setReady(true);
  }, []);
  const toggle = () => {
    const n = theme === 'dark' ? 'light' : 'dark';
    setTheme(n); localStorage.setItem('theme', n);
    document.documentElement.className = n === 'light' ? 'light' : '';
  };
  if (!ready) return <div style={{ visibility: 'hidden' }}>{children}</div>;
  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}
