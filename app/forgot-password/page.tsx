'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';

export default function ForgotPasswordPage() {
  const [studentId, setStudentId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanStudentId = studentId.trim();
    if (!cleanStudentId) {
      setErrorMsg('Please enter your LPU registration number.');
      return;
    }

    setLoading(true);

    try {
      // 1. Look up student's email via server API route
      const lookupRes = await fetch('/api/auth/lookup-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: cleanStudentId }),
      });

      if (lookupRes.ok) {
        const data = await lookupRes.json();
        const email = data?.email;

        if (email) {
          const origin =
            typeof window !== 'undefined' ? window.location.origin : '';
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/reset-password`,
          });
        }
      }

      // Always show generic confirmation message regardless of whether lookup succeeded
      setSubmitted(true);
    } catch {
      // For unexpected client errors, still show confirmation to prevent enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F3] text-[#1C1B18] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[rgba(0,0,0,0.07)] rounded-lg p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-3">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-[#1C1B18] tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-[#6E6B5F]">
            Enter your LPU registration number to receive a secure recovery link.
          </p>
        </div>

        {/* Error notification if input validation fails */}
        {errorMsg && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[rgba(220,38,38,0.2)] text-xs text-[#DC2626] font-medium"
          >
            {errorMsg}
          </div>
        )}

        {submitted ? (
          <div className="space-y-5">
            <div
              role="status"
              className="p-4 rounded-lg bg-[#ECFDF5] border border-[rgba(5,150,105,0.2)] text-xs text-[#059669] font-medium leading-relaxed"
            >
              If that registration number is registered, we have sent a password reset link to the associated recovery email address. Please check your inbox and spam folder.
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full min-h-[44px] px-6 py-3 rounded-lg bg-[#C96442] hover:bg-[#B5572E] active:bg-[#9E4622] text-[#FFFFFF] text-sm font-semibold transition-colors flex items-center justify-center text-center select-none"
              >
                Return to Sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="studentId"
                className="block text-xs font-semibold text-[#1C1B18] mb-1.5"
              >
                LPU Registration Number <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="studentId"
                type="text"
                required
                autoFocus
                autoCapitalize="characters"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 12100001"
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FFFFFF] text-sm text-[#1C1B18] placeholder:text-[#A8A49A] rounded-lg border border-[rgba(0,0,0,0.14)] focus:border-[#C96442] focus:ring-2 focus:ring-[#C96442]/15 outline-none transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] px-6 py-3 rounded-lg bg-[#C96442] hover:bg-[#B5572E] active:bg-[#9E4622] disabled:opacity-50 disabled:cursor-not-allowed text-[#FFFFFF] text-sm font-semibold transition-colors flex items-center justify-center shadow-none select-none"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-[rgba(0,0,0,0.07)] text-center">
              <Link
                href="/login"
                className="text-xs text-[#6E6B5F] hover:text-[#1C1B18] transition-colors min-h-[44px] inline-flex items-center justify-center font-medium"
              >
                ← Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
