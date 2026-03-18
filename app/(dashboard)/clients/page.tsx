'use client';

import { useState, useEffect } from 'react';
import { Client } from '@/lib/types';
import ClientCard from '@/components/clients/ClientCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');

  const fetchClients = async (): Promise<Client[]> => {
    const res = await fetch('/api/clients');
    const data: Client[] = await res.json();
    setClients(data);
    return data;
  };

  const fetchCounts = async (data: Client[]) => {
    const sessionsRes = await fetch('/api/sessions');
    const sessions: { clientId: string }[] = await sessionsRes.json();
    const counts: Record<string, number> = {};
    data.forEach(c => {
      counts[c.id] = sessions.filter(s => s.clientId === c.id).length;
    });
    setSessionCounts(counts);
  };

  useEffect(() => {
    fetchClients().then(fetchCounts);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteClient = async (id: string, name: string) => {
    if (!confirm(`Delete client "${name}"?`)) return;
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Client deleted');
      fetchClients().then(fetchCounts);
    } else {
      toast.error('Failed to delete client');
    }
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients…"
          className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4094d9]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#64748B]">
          <UsersEmptyIcon />
          <p className="mt-3 font-medium">No clients found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(client => (
            <ClientCard key={client.id} client={client} sessionCount={sessionCounts[client.id] ?? 0} onDelete={deleteClient} />
          ))}
        </div>
      )}

    </div>
  );
}

function UsersEmptyIcon() {
  return (
    <svg className="w-12 h-12 mx-auto text-[#CBD5E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}


