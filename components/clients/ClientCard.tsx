'use client';

import Link from 'next/link';
import { Client } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import { EnvelopeIcon, PhoneIcon, BuildingOfficeIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ClientCardProps {
  client: Client;
  sessionCount?: number;
  onDelete?: (id: string, name: string) => void;
}

export default function ClientCard({ client, sessionCount = 0, onDelete }: ClientCardProps) {
  return (
    <div className="relative group">
      <Link
        href={`/clients/${client.id}`}
        className="block bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:shadow-card-hover hover:border-[#4094d9]/30 transition-all"
      >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-[#0F172A] font-[Sora]">{client.name}</p>
          <div className="flex items-center gap-1 text-sm text-[#64748B] mt-0.5">
            <BuildingOfficeIcon className="w-4 h-4" />
            {client.company}
          </div>
        </div>
        <Badge status={client.status} />
      </div>
      <div className="space-y-1 text-sm text-[#64748B]">
        <div className="flex items-center gap-2">
          <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <PhoneIcon className="w-4 h-4 flex-shrink-0" />
          {client.phone}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
        <span className="text-xs text-[#64748B]">
          {sessionCount} session{sessionCount !== 1 ? 's' : ''}
        </span>
        <span className="text-xs font-medium text-[#4094d9] hover:underline">View →</span>
      </div>
      </Link>
      {onDelete && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(client.id, client.name); }}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-[#94A3B8] hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete client"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
