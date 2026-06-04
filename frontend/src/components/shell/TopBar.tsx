'use client';

import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { Button } from '@/components/ui/Button';
import { usePalette } from '@/components/PaletteProvider';

export function TopBar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const openPalette = usePalette();

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--border)] px-6 backdrop-blur"
      style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)' }}
    >
      {/* Search — fills all available space */}
      <button
        onClick={openPalette}
        className="flex h-10 flex-1 items-center gap-3 rounded-md border border-[var(--border)] px-3 text-left text-sm text-[var(--text-mute)] transition-colors hover:border-[var(--text-mute)] hover:text-[var(--text-dim)]"
        aria-label="Search the archive"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="font-mono">search the archive…</span>
        <kbd className="ml-auto rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--text-mute)]">
          ⌘K
        </kbd>
      </button>

      <div className="flex flex-none items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-mute)] transition-colors hover:text-[var(--text)]"
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" className="ic ic-sm">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="ic ic-sm">
              <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
            </svg>
          )}
        </button>

        {user && (
          <>
            <span className="hidden text-sm text-[var(--text-dim)] sm:inline">{user.name ?? user.email}</span>
            <Button variant="ghost" onClick={() => logout()}>
              Sign out
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
