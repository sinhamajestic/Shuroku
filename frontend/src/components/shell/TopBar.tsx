'use client';

import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { usePalette } from '@/components/PaletteProvider';

export function TopBar() {
  const { user, logout } = useAuth();
  const openPalette = usePalette();

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ink-line px-6 backdrop-blur"
      style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)' }}
    >
      <button
        onClick={openPalette}
        className="flex h-10 flex-1 items-center gap-3 rounded-md border border-ink-line px-3 text-left text-sm text-washi-400 transition-colors hover:border-ink-700 hover:text-washi-200 md:max-w-md"
        aria-label="Search the archive"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="font-mono">search the archive…</span>
        <kbd className="ml-auto rounded border border-ink-line px-1.5 py-0.5 font-mono text-[11px] text-washi-400">⌘K</kbd>
      </button>

      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="hidden text-sm text-washi-200 sm:inline">{user.name ?? user.email}</span>
            <Button variant="ghost" onClick={() => logout()}>
              Sign out
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
