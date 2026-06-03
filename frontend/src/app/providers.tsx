'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider, pushToast } from '@/lib/toast';
import { ThemeProvider } from '@/lib/theme';
import { ApiError } from '@/lib/api';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          // Centralised confirmation toasts: any mutation with meta.toast fires one.
          onSuccess: (_data, _vars, _ctx, mutation) => {
            const msg = mutation.meta?.toast as string | undefined;
            if (msg) pushToast(msg);
          },
          onError: (err) => {
            pushToast(err instanceof ApiError ? err.message : 'Something went wrong', 'danger');
          },
        }),
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
