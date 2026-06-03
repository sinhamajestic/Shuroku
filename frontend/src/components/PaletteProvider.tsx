'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { SearchPalette } from './SearchPalette';

const PaletteContext = createContext<() => void>(() => {});
export const usePalette = () => useContext(PaletteContext);

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <PaletteContext.Provider value={() => setOpen(true)}>
      {children}
      {open && <SearchPalette onClose={() => setOpen(false)} />}
    </PaletteContext.Provider>
  );
}
