'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
});
export const useTheme = () => useContext(ThemeContext);

function resolveInitial(): Theme {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('shuroku-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  // No explicit choice yet → follow the OS.
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // The inline script in layout.tsx already set data-theme before paint;
    // adopt whatever is there (falling back to a fresh resolve) so the toggle
    // label is correct.
    const current = (document.documentElement.dataset.theme as Theme) || resolveInitial();
    setTheme(current);
    document.documentElement.dataset.theme = current;

    // Only keep following the system if the user hasn't picked explicitly.
    const saved = localStorage.getItem('shuroku-theme');
    if (saved === 'light' || saved === 'dark') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      const next: Theme = e.matches ? 'dark' : 'light';
      setTheme(next);
      document.documentElement.dataset.theme = next;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem('shuroku-theme', next);
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
