'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Rail } from './Rail';
import { TopBar } from './TopBar';
import { PaletteProvider } from '@/components/PaletteProvider';

const MOBILE_TABS = [
  { href: '/', label: 'Library' },
  { href: '/search', label: 'Search' },
  { href: '/collections', label: 'Lists' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [railOpen, setRailOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <span className="font-jp text-2xl text-[var(--text-mute)] animate-pulse">収録</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <PaletteProvider>
      <div
        className={`min-h-dvh transition-[padding] duration-200 ${railOpen ? 'md:pl-rail' : 'md:pl-14'}`}
      >
        <Rail open={railOpen} onToggle={() => setRailOpen((o) => !o)} />
        <TopBar />
        <main className="mx-auto w-full max-w-content px-6 py-12 pb-24 md:pb-12">{children}</main>

        {/* Mobile bottom tabs */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center justify-around border-t border-[var(--border)] bg-[var(--surface)] md:hidden">
          {MOBILE_TABS.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 text-xs ${
                  active ? 'text-shu-400' : 'text-[var(--text-dim)]'
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </PaletteProvider>
  );
}
