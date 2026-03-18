'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

export default function TestEmailPage() {
  const [email, setEmail] = useState('allianzsynergia.web@gmail.com');
  const [loading, setLoading] = useState(false);

  const handleSendTestEmail = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/test/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }

      toast.success(data.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error sending test email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-[#160D76] font-[Sora] mb-2">Test Email</h1>
          <p className="text-sm text-[#64748B] mb-6">Send a test acknowledgement confirmation email</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#160D76] focus:border-transparent"
              />
            </div>

            <Button
              type="button"
              onClick={handleSendTestEmail}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Test Email'}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-2">ℹ️ Test Data Included:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Session: POS System Training</li>
              <li>Trainer: Trainer Admin</li>
              <li>Campaign: Q1 2026 Retail Campaign</li>
              <li>Position: Store Manager</li>
              <li>5 sample features with descriptions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
