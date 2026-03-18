'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

const titleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/clients': 'Clients',
  '/systems': 'Systems',
  '/sessions': 'Sessions',
  '/users': 'Users',
};

const subtitleMap: Record<string, string> = {
  '/': 'Overview of your training operations',
  '/clients': 'Manage your client database',
  '/systems': 'Training systems & feature sets',
  '/sessions': 'Training sessions & acknowledgments',
  '/users': 'Manage user accounts & access',
};

const actionMap: Record<string, { label: string; href: string }> = {
  '/systems': { label: 'Add System', href: '/systems?new=1' },
  '/sessions': { label: 'New Session', href: '/sessions/new' },
};

export default function Header() {
  const pathname = usePathname();

  const match = Object.entries(titleMap)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([key]) => pathname === key || pathname.startsWith(key + '/'));

  const title = match?.[1] ?? 'Training';
  const subtitle = subtitleMap[match?.[0] ?? ''];
  const action = actionMap[pathname];

  return (
    <header className="h-16 border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold text-[#0F172A] font-[Sora]">{title}</h1>
        {subtitle && <p className="text-xs text-[#64748B] -mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 bg-[#160D76] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1E1199] transition-colors shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          {action.label}
        </Link>
      )}
    </header>
  );
}
