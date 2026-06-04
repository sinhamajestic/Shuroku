'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Library' },
  { href: '/collections', label: 'Collections' },
];

function CollapseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ic ic-sm" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  );
}

export function Rail({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  // Collapsed: a thin strip that still holds the toggle, so the sidebar can
  // always be re-opened from the sidebar itself.
  if (!open) {
    return (
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-14 flex-col items-center border-r border-[var(--border)] bg-[var(--surface)] py-6">
        <button
          onClick={onToggle}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-mute)] transition-colors hover:text-[var(--text)]"
        >
          <CollapseIcon />
        </button>
      </aside>
    );
  }

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-rail flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6">
      <div className="mb-8 flex items-center justify-between px-2">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-jp text-xl text-[var(--text)]">収録</span>
          <span className="font-display text-lg text-[var(--text-dim)]">Shuroku</span>
        </Link>
        <button
          onClick={onToggle}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-md text-[var(--text-mute)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <CollapseIcon />
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`relative flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors ${
                active
                  ? 'text-[var(--text)]'
                  : 'text-[var(--text-dim)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
              }`}
              style={active ? { background: 'var(--shu-tint)' } : undefined}
            >
              {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-shu-500" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <Link
          href="/settings"
          aria-current={pathname === '/settings' ? 'page' : undefined}
          className={`flex h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors ${
            pathname === '/settings'
              ? 'text-[var(--text)]'
              : 'text-[var(--text-dim)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
          }`}
        >
          Profile
        </Link>
      </div>
    </aside>
  );
}
