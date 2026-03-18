import clsx from 'clsx';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-[#160D76] text-white hover:bg-[#1E1199] focus:ring-[#160D76] shadow-sm': variant === 'primary',
          'bg-white text-[#160D76] border border-[#E2E8F0] hover:bg-slate-50 hover:border-[#4094d9]/30 focus:ring-[#4094d9]': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600': variant === 'danger',
          'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 focus:ring-slate-300': variant === 'ghost',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
