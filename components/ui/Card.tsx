import clsx from 'clsx';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export default function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={clsx('bg-white rounded-2xl border border-[#E2E8F0] shadow-card', padding && 'p-6', className)}>
      {children}
    </div>
  );
}
