'use client';

import { useState } from 'react';
import SignaturePad from '@/components/ui/SignaturePad';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface AcknowledgmentFormProps {
  sessionId: string;
  trainerName: string;
  onSuccess: (ack: { clientName: string; acknowledgedAt: string }) => void;
}

export default function AcknowledgmentForm({ sessionId, trainerName, onSuccess }: AcknowledgmentFormProps) {
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [campaign, setCampaign] = useState('');
  const [position, setPosition] = useState('');
  const [comments, setComments] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) { toast.error('Please enter your full name.'); return; }
    if (!email.trim()) { toast.error('Please enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Please enter a valid email address.'); return; }
    if (!campaign.trim()) { toast.error('Please enter your campaign.'); return; }
    if (!position.trim()) { toast.error('Please enter your position.'); return; }
    if (!agreed) { toast.error('Please agree to the acknowledgment statement.'); return; }
    if (!signature) { toast.error('Please provide your signature.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, email, campaign, position, clientSignature: signature, agreeToTerms: agreed, comments }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Submission failed');
      }
      const data = await res.json();
      onSuccess({ clientName, acknowledgedAt: data.acknowledgedAt });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-5 text-sm text-[#0F172A] leading-relaxed">
        <p className="font-semibold text-[#160D76] mb-2 font-[Sora]">ACKNOWLEDGMENT STATEMENT</p>
        <p>
          I, the undersigned, acknowledge that I have attended and participated in the system walkthrough and training conducted
          by <strong>{trainerName}</strong> on the above date. I confirm that the features listed above were demonstrated and
          explained to me, and I understand how to use them.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Full Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76] focus:border-transparent"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email Address <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76] focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Campaign <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={campaign}
            onChange={e => setCampaign(e.target.value)}
            placeholder="e.g. Retail Sales Q1"
            className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76] focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Position <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={position}
            onChange={e => setPosition(e.target.value)}
            placeholder="e.g. Team Leader"
            className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76] focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Comments <span className="text-[#64748B]">(optional)</span></label>
        <textarea
          value={comments}
          onChange={e => setComments(e.target.value)}
          placeholder="Any additional comments or concerns..."
          rows={3}
          className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#160D76] focus:border-transparent"
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="w-5 h-5 mt-0.5 rounded border-[#CBD5E1] text-[#4094d9] focus:ring-[#4094d9] flex-shrink-0"
        />
        <span className="text-sm text-[#0F172A]">I agree to the above acknowledgment statement</span>
      </label>

      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">Signature <span className="text-red-500">*</span></label>
        <SignaturePad onSave={setSignature} onClear={() => setSignature('')} />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit & Confirm'}
      </Button>
    </form>
  );
}
