'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedLogo from '@/components/ui/AnimatedLogo';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#160D76] via-[#1E1199] to-[#0F0A54] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#4094d9]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F08530]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative w-full max-w-md mx-4">
        {/* Logo & Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <AnimatedLogo size={64} />
          </div>
          <h1 className="text-white font-bold text-xl font-[Sora] tracking-wide">TRAINING</h1>
          <p className="text-[#4094d9] text-xs font-semibold tracking-[4px] mt-0.5">ACKNOWLEDGEMENT</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-white text-lg font-semibold font-[Sora]">Welcome Back</h2>
            <p className="text-white/50 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-200 text-sm rounded-lg px-4 py-3 text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-white/70 text-xs font-medium mb-1.5 tracking-wide uppercase">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 
                           focus:outline-none focus:ring-2 focus:ring-[#4094d9]/50 focus:border-[#4094d9]/50 transition-all text-sm"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-white/70 text-xs font-medium mb-1.5 tracking-wide uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 
                           focus:outline-none focus:ring-2 focus:ring-[#4094d9]/50 focus:border-[#4094d9]/50 transition-all text-sm"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#F08530] to-[#e6751f] text-white font-semibold py-3 rounded-lg 
                         hover:from-[#e6751f] hover:to-[#d4681a] transition-all shadow-lg shadow-[#F08530]/25
                         disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6 tracking-wide">
          © 2026 Training Acknowledgement System
        </p>
      </div>
    </div>
  );
}
