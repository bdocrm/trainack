'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AnimatedLogo from '@/components/ui/AnimatedLogo';
import AcknowledgmentForm from '@/components/sessions/AcknowledgmentForm';
import FeatureList from '@/components/sessions/FeatureList';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Feature, TrainingSession, System } from '@/lib/types';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

type SessionDetail = TrainingSession & {
  system: System;
  coveredFeatures: Feature[];
};

export default function SignPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [success, setSuccess] = useState<{ clientName: string; acknowledgedAt: string } | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${id}`).then(r => r.json()).then(data => {
      setSession(data);
    });
  }, [id]);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="text-[#64748B]">Loading…</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#0F172A] font-[Sora] mb-2">Acknowledgment Received</h2>
          <p className="text-[#64748B] mb-4">Thank you, <strong>{success.clientName}</strong>. Your acknowledgment has been recorded.</p>
          <p className="text-sm text-[#64748B]">Submitted on {formatDateTime(success.acknowledgedAt)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-4 sm:py-8 px-3 sm:px-4 print:bg-white print:py-0">
      <div className="max-w-2xl mx-auto">
        {/* Document Header */}
        <div className="bg-gradient-to-r from-[#160D76] to-[#1E1199] text-white rounded-t-2xl px-5 sm:px-8 py-5 sm:py-6 print:rounded-none">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <AnimatedLogo size={36} />
              <div>
                <span className="font-bold text-sm font-[Sora] tracking-wide block">TRAINING</span>
                <span className="text-[#4094d9] text-[10px] font-semibold tracking-[3px] block">ACKNOWLEDGEMENT</span>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] text-white/50 uppercase tracking-widest">Official Document</p>
              <p className="font-semibold font-[Sora] text-xs sm:text-sm">Training Acknowledgment Form</p>
            </div>
          </div>
          {/* Brand underline */}
          <div className="flex gap-0.5 mt-4">
            <div className="h-1 flex-1 rounded-full bg-[#160D76]/50" />
            <div className="h-1 flex-1 rounded-full bg-[#4094d9]" />
            <div className="h-1 flex-1 rounded-full bg-[#F08530]" />
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-b-2xl print:shadow-none print:rounded-none">
          {/* Session Info */}
          <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-[#E2E8F0]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Session', value: session.title },
                { label: 'System', value: `${session.system?.name}` },
                { label: 'Training Date', value: formatDate(session.sessionDate) },
                { label: 'Trainer', value: session.trainerId },
                { label: 'Location', value: session.location },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-[10px] sm:text-xs text-[#64748B] uppercase tracking-wide">{label}</span>
                  <span className="font-medium text-[#0F172A] text-sm mt-0.5">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          {session.coveredFeatures.length > 0 && (
            <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-[#E2E8F0]">
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#64748B] mb-4">Features & Functions Covered</h3>
              <FeatureList features={session.coveredFeatures} />
            </div>
          )}

          {/* Form or Already Signed */}
          <div className="px-5 sm:px-8 py-5 sm:py-6">
            <AcknowledgmentForm
              sessionId={id}
              trainerName={session.trainerId}
              onSuccess={setSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
