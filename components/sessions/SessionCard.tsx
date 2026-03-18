import Link from 'next/link';
import { TrainingSession } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface SessionCardProps {
  session: TrainingSession;
  clientName?: string;
  systemName?: string;
}

export default function SessionCard({ session, clientName, systemName }: SessionCardProps) {
  return (
    <Link
      href={`/sessions/${session.id}`}
      className="block bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:shadow-card-hover hover:border-[#4094d9]/30 transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          {clientName && <p className="font-semibold text-[#0F172A] font-[Sora]">{clientName}</p>}
          {systemName && <p className="text-sm text-[#64748B]">{systemName}</p>}
        </div>
        <Badge status={session.status} />
      </div>
      <div className="flex items-center gap-4 text-sm text-[#64748B] mt-2">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4" />
          {formatDate(session.sessionDate)}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPinIcon className="w-4 h-4" />
          {session.location}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
        <span className="text-xs text-[#64748B]">
          {session.coveredFeatureIds.length} feature{session.coveredFeatureIds.length !== 1 ? 's' : ''} covered
        </span>
        <span className="text-xs font-medium text-[#4094d9]">View →</span>
      </div>
    </Link>
  );
}
