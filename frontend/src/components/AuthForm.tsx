'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      if (isRegister) await register(email, password, name || undefined);
      else await login(email, password);
      router.replace('/');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  // Structural classes stay in Tailwind; colors come from the semantic theme
  // tokens (globals.css) so the form follows light/dark.
  const field =
    'h-11 w-full rounded-md border px-3 text-sm placeholder:text-washi-400 focus:border-shu-500 focus:outline-none';
  const fieldStyle = {
    background: 'var(--surface-2)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  } as const;

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6">
      <span
        className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 select-none font-jp text-[40vh] leading-none"
        style={{ color: 'var(--surface-2)' }}
      >
        収
      </span>

      {/* Theme toggle (the auth screens have no Rail/TopBar) */}
      <button
        type="button"
        onClick={toggle}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:text-washi-50"
        style={{ borderColor: 'var(--border)', color: 'var(--text-mute)' }}
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

      <div
        className="relative w-full max-w-sm rounded-lg border p-8 shadow-e2"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="mb-1 flex items-baseline gap-2">
          <span className="font-jp text-xl" style={{ color: 'var(--text)' }}>
            収録
          </span>
          <span className="font-display text-lg" style={{ color: 'var(--text-dim)' }}>
            Shuroku<span className="text-shu-500">.</span>
          </span>
        </div>
        <p className="mb-6 font-display text-sm italic" style={{ color: 'var(--text-mute)' }}>
          {isRegister ? 'Start your archive.' : 'Welcome back to your archive.'}
        </p>

        <div className="flex flex-col gap-3">
          {isRegister && (
            <input
              className={field}
              style={fieldStyle}
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            className={field}
            style={fieldStyle}
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={field}
            style={fieldStyle}
            type="password"
            placeholder="Password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />

          {error && <p className="font-mono text-xs text-shu-400">{error}</p>}

          <Button className="mt-1 w-full" onClick={submit} disabled={busy || !email || !password}>
            {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-mute)' }}>
          {isRegister ? (
            <>
              Already have an account?{' '}
              <Link href="/login" className="text-shu-400 hover:text-shu-500">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{' '}
              <Link href="/register" className="text-shu-400 hover:text-shu-500">
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
