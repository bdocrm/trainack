'use client';

import { useEffect, useState, Suspense } from 'react';
import { System } from '@/lib/types';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { PlusIcon, ComputerDesktopIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';

function SystemsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [systems, setSystems] = useState<System[]>([]);
  const [showModal, setShowModal] = useState(searchParams.get('new') === '1');
  const [form, setForm] = useState({ name: '', description: '', version: '1.0' });
  const [saving, setSaving] = useState(false);

  const fetchSystems = async () => {
    const res = await fetch('/api/systems');
    setSystems(await res.json());
  };

  useEffect(() => { fetchSystems(); }, []);

  const deleteSystem = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete system "${name}"? This will also delete all its features.`)) return;
    const res = await fetch(`/api/systems/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('System deleted');
      fetchSystems();
    } else {
      toast.error('Failed to delete system');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success('System created! Now add its features.');
      router.push(`/systems/${data.id}?addFeature=1`);
    } catch {
      toast.error('Failed to add system');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowModal(true)}>
          <PlusIcon className="w-4 h-4" /> Add New System
        </Button>
      </div>

      {systems.length === 0 ? (
        <div className="text-center py-20 text-[#64748B]">
          <ComputerDesktopIcon className="w-12 h-12 mx-auto text-[#CBD5E1]" />
          <p className="mt-3 font-medium">No systems yet</p>
          <p className="text-sm mt-1">Add your first system to begin managing features</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {systems.map(system => (
            <div key={system.id} className="relative group">
              <Link href={`/systems/${system.id}`}>
                <Card className="hover:shadow-md hover:border-[#160D76]/30 transition-all cursor-pointer h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#160D76]/10 flex items-center justify-center flex-shrink-0">
                      <ComputerDesktopIcon className="w-5 h-5 text-[#160D76]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0F172A] font-[Sora] truncate">{system.name}</p>
                      <span className="text-xs bg-slate-100 text-[#64748B] px-2 py-0.5 rounded font-mono">{system.version}</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#64748B] line-clamp-2 mb-3">{system.description}</p>
                  <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#4094d9]/10 text-[#4094d9] px-2 py-0.5 rounded-full">
                      {system.features?.length ?? 0} features
                    </span>
                  </div>
                </Card>
              </Link>
              <button
                onClick={(e) => deleteSystem(e, system.id, system.name)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-[#94A3B8] hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete system"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New System">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'System Name', required: true, placeholder: 'e.g. POS Point-of-Sale System' },
            { key: 'version', label: 'Version', placeholder: 'e.g. v2.1' },
          ].map(({ key, label, required, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
              <input
                type="text"
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                required={required}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76]"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#160D76]"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Saving…' : 'Add System'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function SystemsPage() {
  return <Suspense><SystemsContent /></Suspense>;
}
