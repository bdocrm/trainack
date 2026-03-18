'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { System, Feature } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FeatureList from '@/components/sessions/FeatureList';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STEPS = ['Session Details', 'Features', 'Review'];

function NewSessionContent() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [systems, setSystems] = useState<System[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [form, setForm] = useState({
    title: '',
    systemId: '',
    trainerId: 'Trainer Admin',
    sessionDate: new Date().toISOString().split('T')[0],
    location: '',
    notes: '',
    coveredFeatureIds: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/systems').then(r => r.json()).then(setSystems);
  }, []);

  useEffect(() => {
    if (form.systemId) {
      fetch(`/api/systems/${form.systemId}/features`).then(r => r.json()).then(setFeatures);
    } else {
      setFeatures([]);
    }
  }, [form.systemId]);

  const selectedSystem = systems.find(s => s.id === form.systemId);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      toast.success('Session created!');
      router.push(`/sessions/${id}`);
    } catch {
      toast.error('Failed to create session');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
              i < step ? 'bg-[#4094d9] border-[#4094d9] text-white' :
              i === step ? 'bg-[#160D76] border-[#160D76] text-white' :
              'bg-white border-[#E2E8F0] text-[#64748B]'
            )}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={clsx('text-sm font-medium hidden sm:block', i === step ? 'text-[#0F172A]' : 'text-[#64748B]')}>{label}</span>
            {i < STEPS.length - 1 && <div className={clsx('flex-1 h-0.5 mx-1', i < step ? 'bg-[#4094d9]' : 'bg-[#E2E8F0]')} />}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 0 && (
        <Card>
          <h2 className="font-semibold text-[#0F172A] font-[Sora] mb-5">Session Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">Session Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. POS System Training – Batch 1"
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">System <span className="text-red-500">*</span></label>
              <select
                value={form.systemId}
                onChange={e => setForm(f => ({ ...f, systemId: e.target.value, coveredFeatureIds: [] }))}
                required
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76]"
              >
                <option value="">Select a system…</option>
                {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">Session Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.sessionDate}
                onChange={e => setForm(f => ({ ...f, sessionDate: e.target.value }))}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. On-site, Pasig City"
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">Trainer Name</label>
              <input
                type="text"
                value={form.trainerId}
                onChange={e => setForm(f => ({ ...f, trainerId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76]"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setStep(1)}
              disabled={!form.title || !form.systemId}
            >
              Next: Select Features →
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2 */}
      {step === 1 && (
        <Card>
          <h2 className="font-semibold text-[#0F172A] font-[Sora] mb-5">Features Covered</h2>
          {features.length === 0 ? (
            <p className="text-sm text-[#64748B] py-4">No features for this system yet. You can add them in Systems.</p>
          ) : (
            <FeatureList
              features={features}
              selectable
              selected={form.coveredFeatureIds}
              onToggle={id => setForm(f => ({
                ...f,
                coveredFeatureIds: f.coveredFeatureIds.includes(id)
                  ? f.coveredFeatureIds.filter(i => i !== id)
                  : [...f.coveredFeatureIds, id],
              }))}
              onSelectAll={ids => setForm(f => ({ ...f, coveredFeatureIds: ids }))}
            />
          )}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1 mt-5">Session Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Any additional notes about this training session…"
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#160D76]"
            />
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
            <Button onClick={() => setStep(2)}>Next: Review →</Button>
          </div>
        </Card>
      )}

      {/* Step 3 */}
      {step === 2 && (
        <Card>
          <h2 className="font-semibold text-[#0F172A] font-[Sora] mb-5">Review & Confirm</h2>
          <div className="space-y-3 text-sm">
            <InfoRow label="Session Title" value={form.title} />
            <InfoRow label="System" value={selectedSystem?.name ?? ''} />
            <InfoRow label="Date" value={formatDate(form.sessionDate)} />
            <InfoRow label="Location" value={form.location || '—'} />
            <InfoRow label="Trainer" value={form.trainerId} />
            <InfoRow label="Features Covered" value={`${form.coveredFeatureIds.length} of ${features.length} features`} />
            {form.notes && <InfoRow label="Notes" value={form.notes} />}
          </div>
          <div className="mt-6 p-4 bg-slate-50 rounded-xl text-sm text-[#64748B] border border-[#E2E8F0]">
            <p className="font-medium text-[#0F172A] mb-1">What happens next?</p>
            <p>The session will be created with <strong>Pending</strong> status. You can then share the acknowledgment link with your client to collect their signature.</p>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
            <Button onClick={handleSubmit} disabled={saving} size="lg">
              {saving ? 'Creating…' : '✓ Create Session'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-[#F1F5F9]">
      <span className="text-[#64748B] w-36 flex-shrink-0">{label}</span>
      <span className="font-medium text-[#0F172A]">{value}</span>
    </div>
  );
}

export default function NewSessionPage() {
  return <NewSessionContent />;
}
