'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { System, Feature } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { PlusIcon, PencilIcon, TrashIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { groupBy } from '@/lib/utils';

const CATEGORIES = ['Core', 'Admin', 'Reports', 'Settings', 'Other'];

export default function SystemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [system, setSystem] = useState<System | null>(null);
  const [showAddFeature, setShowAddFeature] = useState(searchParams.get('addFeature') === '1');
  const [editFeature, setEditFeature] = useState<Feature | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'Core' });
  const [saving, setSaving] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchSystem = async () => {
    const res = await fetch(`/api/systems/${id}`);
    setSystem(await res.json());
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchSystem(); }, [id]);

  // Clear the addFeature param from URL once modal is closed
  const closeAddFeature = () => {
    setShowAddFeature(false);
    if (searchParams.get('addFeature') === '1') router.replace(`/systems/${id}`);
  };

  const openEdit = (f: Feature) => {
    setEditFeature(f);
    setForm({ title: f.title, description: f.description, category: f.category });
  };

  const handleAddFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/systems/${id}/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('Feature added!');
      closeAddFeature();
      setForm({ title: '', description: '', category: 'Core' });
      await fetchSystem();
    } catch {
      toast.error('Failed to add feature');
    } finally {
      setSaving(false);
    }
  };

  const handleEditFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFeature) return;
    setSaving(true);
    try {
      await fetch(`/api/features/${editFeature.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      toast.success('Feature updated!');
      setEditFeature(null);
      await fetchSystem();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const deleteFeature = async (fid: string) => {
    if (!confirm('Delete this feature?')) return;
    await fetch(`/api/features/${fid}`, { method: 'DELETE' });
    toast.success('Feature deleted');
    await fetchSystem();
  };

  const toggleExpand = (fid: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(fid)) {
        next.delete(fid);
      } else {
        next.add(fid);
      }
      return next;
    });
  };

  if (!system) return <div className="flex items-center justify-center py-20 text-[#64748B]">Loading…</div>;

  const grouped = groupBy(system.features, 'category');

  const featureFormFields = (
    <>
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1">Title <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          required
          placeholder="e.g. User Login & Authentication"
          className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={3}
          className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#160D76]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1">Category</label>
        <select
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76]"
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
    </>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Info */}
        <Card className="md:col-span-1 h-fit">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#160D76]/10 flex items-center justify-center">
              <ComputerDesktopIcon className="w-5 h-5 text-[#160D76]" />
            </div>
            <div>
              <p className="font-semibold text-[#0F172A] font-[Sora]">{system.name}</p>
              <span className="text-xs bg-slate-100 text-[#64748B] px-2 py-0.5 rounded font-mono">{system.version}</span>
            </div>
          </div>
          <p className="text-sm text-[#64748B] leading-relaxed">{system.description || 'No description.'}</p>
          <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
            <p className="text-xs text-[#64748B]">{system.features.length} feature{system.features.length !== 1 ? 's' : ''} documented</p>
          </div>
        </Card>

        {/* Features */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#0F172A] font-[Sora]">Features & Functions</h2>
            <Button size="sm" onClick={() => { setForm({ title: '', description: '', category: 'Core' }); setShowAddFeature(true); }}>
              <PlusIcon className="w-4 h-4" /> Add Feature
            </Button>
          </div>

          {system.features.length === 0 ? (
            <Card>
              <p className="text-center text-[#64748B] py-8">No features yet. Add the first one!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([category, features]) => (
                <Card key={category} padding={false}>
                  <div className="px-5 py-3 border-b border-[#E2E8F0] bg-slate-50 rounded-t-xl">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">{category}</span>
                  </div>
                  <div className="divide-y divide-[#F1F5F9]">
                    {features.map(f => (
                      <div key={f.id}>
                        <div
                          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => toggleExpand(f.id)}
                        >
                          <span className="font-medium text-sm text-[#0F172A]">{f.title}</span>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            <button
                              onClick={e => { e.stopPropagation(); openEdit(f); }}
                              className="p-1 rounded text-[#64748B] hover:text-[#160D76] hover:bg-slate-100"
                            >
                              <PencilIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); deleteFeature(f.id); }}
                              className="p-1 rounded text-[#64748B] hover:text-red-600 hover:bg-red-50"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                            <svg className={`w-4 h-4 text-[#64748B] transition-transform ${expandedIds.has(f.id) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {expandedIds.has(f.id) && (
                          <div className="px-5 pb-4 text-sm text-[#64748B] leading-relaxed">
                            {f.description || <em>No description provided.</em>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Feature Modal */}
      <Modal open={showAddFeature} onClose={closeAddFeature} title="Add Feature">
        <form onSubmit={handleAddFeature} className="space-y-4">
          {featureFormFields}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={closeAddFeature}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Saving…' : 'Add Feature'}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Feature Modal */}
      <Modal open={!!editFeature} onClose={() => setEditFeature(null)} title="Edit Feature">
        <form onSubmit={handleEditFeature} className="space-y-4">
          {featureFormFields}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditFeature(null)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
