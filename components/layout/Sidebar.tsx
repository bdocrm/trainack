'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  HomeIcon,
  UsersIcon,
  ComputerDesktopIcon,
  CalendarDaysIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const nav = [
  { href: '/', label: 'Dashboard', icon: HomeIcon },
  { href: '/clients', label: 'Clients', icon: UsersIcon },
  { href: '/systems', label: 'Systems', icon: ComputerDesktopIcon },
  { href: '/sessions', label: 'Sessions', icon: CalendarDaysIcon },
  { href: '/users', label: 'Users', icon: UserGroupIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const NavLinks = () => (
    <>
      {nav.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={clsx(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
              active
                ? 'bg-white/15 text-white shadow-sm backdrop-blur-sm'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F08530]" />}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-[#160D76] to-[#0F0A54] min-h-screen">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <Image src="/img/logo-icon.svg" alt="Logo" width={36} height={36} className="flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-white font-bold text-sm font-[Sora] tracking-wide block">TRAINING</span>
            <span className="text-[#4094d9] text-[10px] font-semibold tracking-[3px] block">ACKNOWLEDGEMENT</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-[2px] text-white/30">Menu</p>
          <NavLinks />
        </nav>
        <div className="px-3 py-3 border-t border-white/10 space-y-2">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            {loggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
          <p className="px-4 text-[10px] text-white/30 tracking-wide">© 2026 Training Acknowledgement</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-[#160D76] flex items-center justify-between px-4 h-14 shadow-lg">
        <div className="flex items-center gap-2.5">
          <Image src="/img/logo-icon.svg" alt="Logo" width={28} height={28} />
          <span className="text-white font-bold text-sm font-[Sora] tracking-wide">TRAINING</span>
        </div>
        <button onClick={() => setOpen(true)} className="text-white/80 hover:text-white p-1">
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-gradient-to-b from-[#160D76] to-[#0F0A54] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Image src="/img/logo-icon.svg" alt="Logo" width={28} height={28} />
                <span className="text-white font-bold text-sm font-[Sora]">TRAINING</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-5 space-y-1">
              <NavLinks />
            </nav>
            <div className="px-3 py-3 border-t border-white/10">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full text-white/60 hover:bg-white/10 hover:text-white transition-all"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
