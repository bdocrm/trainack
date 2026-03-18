'use client';

import { useEffect, useState } from 'react';
import { TrainingSession, System } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { MagnifyingGlassIcon, PlusIcon, CalendarIcon, MapPinIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

type EnrichedSession = TrainingSession & { systemName: string };

export default function SessionsPage() {
  const [sessions, setSessions] = useState<EnrichedSession[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'acknowledged' | 'signed'>('all');
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    const [sessRes, sysRes] = await Promise.all([
      fetch('/api/sessions').then(r => r.json()),
      fetch('/api/systems').then(r => r.json()),
    ]);
    const sysMap: Record<string, System> = Object.fromEntries((sysRes as System[]).map((s: System) => [s.id, s]));
    setSessions((sessRes as TrainingSession[]).map(s => ({
      ...s,
      systemName: sysMap[s.systemId]?.name ?? 'Unknown',
    })));
    setLoading(false);
  };

  useEffect(() => { fetchSessions(); }, []);

  const deleteSession = async (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete session "${title}"? This will also delete all its acknowledgments.`)) return;
    const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Session deleted');
      fetchSessions();
    } else {
      toast.error('Failed to delete session');
    }
  };

  const filtered = sessions.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false;
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.systemName.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sessions…"
            className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4094d9]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'acknowledged', 'signed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-[#160D76] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <Link href="/sessions/new" className="inline-flex items-center gap-2 bg-[#160D76] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1E1199] transition-colors whitespace-nowrap shadow-sm">
          <PlusIcon className="w-4 h-4" /> New Session
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#64748B]">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[#64748B]">
          <CalendarIcon className="w-12 h-12 mx-auto text-[#CBD5E1]" />
          <p className="mt-3 font-medium">No sessions found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] divide-y divide-[#F1F5F9]">
          {filtered.map(s => (
            <Link key={s.id} href={`/sessions/${s.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
              <div className="min-w-0">
                <p className="font-medium text-[#0F172A] truncate">{s.title}</p>
                <p className="text-sm text-[#64748B] truncate">{s.systemName}</p>
                <div className="flex items-center gap-4 text-xs text-[#64748B] mt-1">
                  <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" />{formatDate(s.sessionDate)}</span>
                  <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3" />{s.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                <span className="hidden sm:block text-xs text-[#64748B]">{s.coveredFeatureIds.length} features</span>
                <Badge status={s.status as 'pending' | 'acknowledged' | 'signed'} />
                <button
                  onClick={(e) => deleteSession(e, s.id, s.title)}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete session"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
