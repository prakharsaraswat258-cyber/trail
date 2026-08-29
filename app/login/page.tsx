'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim() || undefined,
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        if (data.session) {
          router.push(redirectPath);
          router.refresh();
        } else {
          setSuccessMsg(
            'Account created! Please check your email to confirm your account or sign in.'
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#FFFFFF] border border-[rgba(0,0,0,0.07)] rounded-lg p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="flex justify-center mb-3">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold text-[#1C1B18] tracking-tight">
          {mode === 'signin' ? 'Sign in to LPU Find' : 'Create an Account'}
        </h1>
        <p className="text-xs text-[#6E6B5F]">
          {mode === 'signin'
            ? 'Access your lost and found reports and manage claims.'
            : 'Join the campus community to report and track items.'}
        </p>
      </div>

      {/* Inline Error Text */}
      {errorMsg && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[rgba(220,38,38,0.2)] text-xs text-[#DC2626] font-medium"
        >
          {errorMsg}
        </div>
      )}

      {/* Success Notification (e.g. email confirmation required) */}
      {successMsg && (
        <div
          role="status"
          className="mb-4 p-3 rounded-lg bg-[#ECFDF5] border border-[rgba(5,150,105,0.2)] text-xs text-[#059669] font-medium"
        >
          {successMsg}
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {mode === 'signup' && (
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-semibold text-[#1C1B18] mb-1.5"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Mercer"
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FFFFFF] text-sm text-[#1C1B18] placeholder:text-[#A8A49A] rounded-lg border border-[rgba(0,0,0,0.14)] focus:border-[#C96442] focus:ring-2 focus:ring-[#C96442]/15 outline-none transition-colors"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-[#1C1B18] mb-1.5"
          >
            Campus Email <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@lpu.in"
            className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FFFFFF] text-sm text-[#1C1B18] placeholder:text-[#A8A49A] rounded-lg border border-[rgba(0,0,0,0.14)] focus:border-[#C96442] focus:ring-2 focus:ring-[#C96442]/15 outline-none transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-[#1C1B18] mb-1.5"
          >
            Password <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FFFFFF] text-sm text-[#1C1B18] placeholder:text-[#A8A49A] rounded-lg border border-[rgba(0,0,0,0.14)] focus:border-[#C96442] focus:ring-2 focus:ring-[#C96442]/15 outline-none transition-colors"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] px-6 py-3 rounded-lg bg-[#C96442] hover:bg-[#B5572E] active:bg-[#9E4622] disabled:opacity-50 disabled:cursor-not-allowed text-[#FFFFFF] text-sm font-semibold transition-colors flex items-center justify-center shadow-none select-none"
          >
            {loading
              ? 'Please wait...'
              : mode === 'signin'
              ? 'Sign in'
              : 'Create account'}
          </button>
        </div>
      </form>

      {/* Toggle between Sign in and Create Account */}
      <div className="mt-6 pt-4 border-t border-[rgba(0,0,0,0.07)] text-center text-xs text-[#6E6B5F]">
        {mode === 'signin' ? (
          <p>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-[#C96442] font-semibold hover:underline min-h-[44px] inline-flex items-center"
            >
              Create account
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-[#C96442] font-semibold hover:underline min-h-[44px] inline-flex items-center"
            >
              Sign in
            </button>
          </p>
        )}
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/"
          className="text-xs text-[#A8A49A] hover:text-[#1C1B18] transition-colors"
        >
          ← Back to browsing items
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F3] text-[#1C1B18] flex items-center justify-center p-4 font-sans">
      <Suspense fallback={<div className="text-xs text-[#6E6B5F]">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
