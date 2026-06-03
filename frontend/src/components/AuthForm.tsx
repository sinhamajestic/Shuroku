'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth();
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

  const field =
    'h-11 w-full rounded-md border border-ink-line bg-ink-800 px-3 text-sm text-washi-50 placeholder:text-washi-600 focus:border-shu-500';

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6">
      <span className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 select-none font-jp text-[40vh] leading-none text-ink-800">
        収
      </span>

      <div className="relative w-full max-w-sm rounded-lg border border-ink-line bg-ink-850 p-8 shadow-e2">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="font-jp text-xl text-washi-50">収録</span>
          <span className="font-display text-lg text-washi-200">
            Shuroku<span className="text-shu-500">.</span>
          </span>
        </div>
        <p className="mb-6 font-display italic text-sm text-washi-400">
          {isRegister ? 'Start your archive.' : 'Welcome back to your archive.'}
        </p>

        <div className="flex flex-col gap-3">
          {isRegister && (
            <input className={field} placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <input
            className={field}
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={field}
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

        <p className="mt-6 text-center text-sm text-washi-400">
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
