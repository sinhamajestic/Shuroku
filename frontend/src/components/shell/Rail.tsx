'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import type { WatchStatus } from '@/types/api';

const NAV = [
  { href: '/', label: 'Library' },
  { href: '/search', label: 'Search' },
  { href: '/collections', label: 'Collections' },
];

const STATUS_FILTERS: { status: WatchStatus; label: string; hue: string }[] = [
  { status: 'WATCHING', label: 'Watching', hue: '#4A6FA5' },
  { status: 'COMPLETED', label: 'Completed', hue: '#7E9B5A' },
  { status: 'PLAN_TO_WATCH', label: 'Plan to Watch', hue: '#A8987F' },
  { status: 'PAUSED', label: 'Paused', hue: '#8A7F73' },
];

export function Rail() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-rail flex-col border-r border-ink-line bg-ink-850 px-4 py-6">
      <Link href="/" className="mb-8 flex items-baseline gap-2 px-2">
        <span className="font-jp text-xl text-washi-50">収録</span>
        <span className="font-display text-lg text-washi-200">
          Shuroku<span className="text-shu-500">.</span>
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`relative flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors ${
                active ? 'text-washi-50' : 'text-washi-200 hover:bg-ink-800 hover:text-washi-50'
              }`}
              style={active ? { background: 'var(--shu-tint)' } : undefined}
            >
              {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-shu-500" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="my-5 h-px bg-ink-line" />

      <div className="flex flex-col gap-1">
        <p className="px-3 pb-1 font-mono text-[11px] uppercase tracking-widest text-washi-400">Status</p>
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.status}
            href={`/?status=${f.status}`}
            className="flex h-9 items-center justify-between rounded-md px-3 text-sm text-washi-200 hover:bg-ink-800 hover:text-washi-50"
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: f.hue }} />
              {f.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-6">
        <Link
          href="/settings"
          aria-current={pathname === '/settings' ? 'page' : undefined}
          className={`flex h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors ${
            pathname === '/settings' ? 'text-washi-50' : 'text-washi-200 hover:bg-ink-800 hover:text-washi-50'
          }`}
        >
          Settings
        </Link>
        <button
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          className="flex h-9 w-9 items-center justify-center rounded-md text-washi-200 hover:bg-ink-800 hover:text-washi-50"
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" className="ic ic-sm"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="ic ic-sm"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>
          )}
        </button>
      </div>
    </aside>
  );
}
