'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import FeatureList from '@/components/sessions/FeatureList';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Feature, TrainingSession, System, Acknowledgment } from '@/lib/types';
import {
  CalendarIcon, MapPinIcon, UserIcon, LinkIcon,
  PrinterIcon, CheckBadgeIcon, EnvelopeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

type SessionDetail = TrainingSession & {
  system: System;
  coveredFeatures: Feature[];
  acknowledgments: Acknowledgment[];
};

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderName, setReminderName] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/sessions/${id}`).then(r => r.json()).then(setSession);
  }, [id]);

  const copyLink = () => {
    const url = `${window.location.origin}/sessions/${id}/sign`;
    navigator.clipboard.writeText(url);
    toast.success('Acknowledgment link copied!');
  };

  const sendReminder = async () => {
    if (!reminderEmail || !reminderName) {
      toast.error('Please fill in both name and email');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/sessions/${id}/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: reminderEmail, name: reminderName }),
      });
      if (!res.ok) throw new Error('Failed to send');
      toast.success(`Reminder sent to ${reminderEmail}`);
      setShowReminder(false);
      setReminderEmail('');
      setReminderName('');
    } catch {
      toast.error('Failed to send reminder email');
    } finally {
      setSending(false);
    }
  };

  if (!session) return <div className="flex items-center justify-center py-20 text-[#64748B]">Loading…</div>;

  const signUrl = `/sessions/${id}/sign`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-[#0F172A] font-[Sora]">
                {session.title}
              </h1>
              <Badge status={session.status as 'pending' | 'acknowledged' | 'signed'} />
            </div>
            <p className="text-[#64748B]">{session.system?.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={copyLink}>
              <LinkIcon className="w-4 h-4" /> Copy Sign Link
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowReminder(true)}>
              <EnvelopeIcon className="w-4 h-4" /> Send Reminder
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <PrinterIcon className="w-4 h-4" /> Print
            </Button>
            <Link href={signUrl}>
              <Button size="sm">Open Sign Page</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[#E2E8F0]">
          {[
            { icon: CalendarIcon, label: 'Date', value: formatDate(session.sessionDate) },
            { icon: MapPinIcon, label: 'Location', value: session.location },
            { icon: UserIcon, label: 'Trainer', value: session.trainerId },
            { icon: CalendarIcon, label: 'Created', value: formatDate(session.createdAt) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <p className="text-xs text-[#64748B] mb-0.5">{label}</p>
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#0F172A]">
                <Icon className="w-4 h-4 text-[#64748B]" />
                {value}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Features Covered */}
      <Card>
        <h2 className="font-semibold text-[#0F172A] font-[Sora] mb-4">
          Features Covered ({session.coveredFeatures.length})
        </h2>
        {session.coveredFeatures.length === 0 ? (
          <p className="text-[#64748B] text-sm">No features were selected for this session.</p>
        ) : (
          <FeatureList features={session.coveredFeatures} />
        )}
      </Card>

      {/* Notes */}
      {session.notes && (
        <Card>
          <h2 className="font-semibold text-[#0F172A] font-[Sora] mb-2">Session Notes</h2>
          <p className="text-sm text-[#64748B] leading-relaxed">{session.notes}</p>
        </Card>
      )}

      {/* Acknowledgments */}
      <Card className={session.acknowledgments.length > 0 ? 'border-emerald-300/50' : undefined}>
        <div className="flex items-center gap-2 mb-4">
          <CheckBadgeIcon className="w-6 h-6 text-emerald-500" />
          <h2 className="font-semibold text-[#0F172A] font-[Sora]">
            Acknowledgments ({session.acknowledgments.length})
          </h2>
        </div>
        {session.acknowledgments.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-[#64748B] text-sm mb-3">No signatures yet. Share the link below with your attendees.</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <code className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg text-[#0F172A] break-all">
                {typeof window !== 'undefined' ? `${window.location.origin}${signUrl}` : signUrl}
              </code>
              <Button size="sm" variant="secondary" onClick={copyLink}>Copy</Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[#64748B] uppercase border-b border-[#E2E8F0]">
                  <th className="pb-2 text-left font-medium">Name</th>
                  <th className="pb-2 text-left font-medium">Campaign</th>
                  <th className="pb-2 text-left font-medium">Position</th>
                  <th className="pb-2 text-left font-medium">Signed At</th>
                  <th className="pb-2 text-left font-medium">Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {session.acknowledgments.map(ack => (
                  <tr key={ack.id}>
                    <td className="py-2.5 font-medium text-[#0F172A]">{ack.clientName}</td>
                    <td className="py-2.5 text-[#64748B]">{ack.campaign}</td>
                    <td className="py-2.5 text-[#64748B]">{ack.position}</td>
                    <td className="py-2.5 text-[#64748B] whitespace-nowrap">{formatDateTime(ack.acknowledgedAt)}</td>
                    <td className="py-2.5">
                      {ack.clientSignature && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ack.clientSignature} alt="sig" className="h-8 max-w-[80px] border border-[#E2E8F0] rounded p-0.5" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Send Reminder Modal */}
      <Modal open={showReminder} onClose={() => setShowReminder(false)} title="Send Signing Reminder" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">Recipient Name</label>
            <input
              type="text"
              value={reminderName}
              onChange={e => setReminderName(e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#4094d9] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">Email Address</label>
            <input
              type="email"
              value={reminderEmail}
              onChange={e => setReminderEmail(e.target.value)}
              placeholder="e.g. attendee@company.com"
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#4094d9] focus:border-transparent outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowReminder(false)}>Cancel</Button>
            <Button size="sm" onClick={sendReminder} disabled={sending}>
              <EnvelopeIcon className="w-4 h-4" />
              {sending ? 'Sending…' : 'Send Reminder'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
