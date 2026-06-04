'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const base =
  'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md font-body font-medium text-sm tracking-wide transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:text-[var(--text-mute)] disabled:border-[var(--border)]';

const variants: Record<Variant, string> = {
  primary: 'bg-shu-500 text-washi-50 hover:bg-shu-400 active:bg-shu-600 active:translate-y-px',
  secondary:
    'border border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
  ghost: 'text-[var(--text-dim)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
  danger: 'border border-[var(--border)] text-shu-400 hover:bg-[var(--surface-2)]',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
