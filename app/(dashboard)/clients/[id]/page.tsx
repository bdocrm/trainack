'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Client, TrainingSession } from '@/lib/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import {
  EnvelopeIcon, PhoneIcon, MapPinIcon, BuildingOfficeIcon,
  CalendarIcon, PencilIcon, CheckIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [sessions, setSessions] = useState<(TrainingSession & { systemName: string })[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Client>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then((c: Client) => {
      setClient(c);
      setForm(c);
    });
    fetch('/api/sessions').then(r => r.json()).then(async (all: (TrainingSession & { coveredFeatureIds: unknown })[]) => {
      const mine = all.filter(s => s.clientId === id);
      const withSystem = await Promise.all(mine.map(async s => {
        const sys = await fetch(`/api/systems/${s.systemId}`).then(r => r.json());
        return { ...s, systemName: sys.name ?? 'Unknown' };
      }));
      setSessions(withSystem);
    });
  }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setClient(form as Client);
      setEditing(false);
      toast.success('Client updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (!client) return <div className="flex items-center justify-center py-20 text-[#64748B]">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <Card className="md:col-span-1 h-fit">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#160D76] flex items-center justify-center text-white text-xl font-bold font-[Sora]">
              {client.name.charAt(0)}
            </div>
            <div className="flex gap-1">
              {editing ? (
                <>
                  <button onClick={save} disabled={saving} className="p-1.5 rounded-lg bg-[#4094d9] text-white hover:bg-[#2E78B8]">
                    <CheckIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setEditing(false); setForm(client); }} className="p-1.5 rounded-lg bg-gray-100 text-[#64748B] hover:bg-gray-200">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg bg-gray-100 text-[#64748B] hover:bg-gray-200">
                  <PencilIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <div className="space-y-3">
              {[
                { key: 'name', label: 'Name' },
                { key: 'company', label: 'Company' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'phone', label: 'Phone' },
                { key: 'address', label: 'Address' },
              ].map(({ key, label, type = 'text' }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-[#64748B] mb-0.5">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof Client] as string ?? ''}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-0.5">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-[#0F172A] font-[Sora] text-lg">{client.name}</p>
                <Badge status={client.status} />
              </div>
              <div className="space-y-2 text-sm text-[#64748B]">
                <div className="flex items-center gap-2"><BuildingOfficeIcon className="w-4 h-4" />{client.company}</div>
                <div className="flex items-center gap-2"><EnvelopeIcon className="w-4 h-4" />{client.email}</div>
                <div className="flex items-center gap-2"><PhoneIcon className="w-4 h-4" />{client.phone || '—'}</div>
                <div className="flex items-start gap-2"><MapPinIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />{client.address || '—'}</div>
              </div>
              <div className="pt-2 border-t border-[#E2E8F0] text-xs text-[#64748B]">
                Client since {formatDate(client.createdAt)}
              </div>
            </div>
          )}
        </Card>

        {/* Sessions */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#0F172A] font-[Sora]">Training Sessions ({sessions.length})</h2>
            <Link href={`/sessions/new?clientId=${id}`}>
              <Button size="sm">Schedule New Session</Button>
            </Link>
          </div>
          {sessions.length === 0 ? (
            <Card>
              <p className="text-center text-[#64748B] py-8">No sessions yet for this client.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => (
                <Link key={s.id} href={`/sessions/${s.id}`}>
                  <Card className="hover:shadow-md hover:border-[#160D76]/30 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#0F172A]">{s.systemName}</p>
                        <div className="flex items-center gap-4 text-sm text-[#64748B] mt-1">
                          <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5" />{formatDate(s.sessionDate)}</span>
                          <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" />{s.location}</span>
                        </div>
                      </div>
                      <Badge status={s.status as 'pending' | 'acknowledged' | 'signed'} />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
