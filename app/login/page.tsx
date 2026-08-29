'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/my-posts';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [studentId, setStudentId] = useState('');
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

    const cleanStudentId = studentId.trim();
    const cleanPassword = password;

    try {
      if (mode === 'signup') {
        const cleanFullName = fullName.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanFullName || !cleanStudentId || !cleanEmail || !cleanPassword) {
          setErrorMsg('All fields are required.');
          setLoading(false);
          return;
        }

        // 1. Check registration number uniqueness via server API route
        const checkRes = await fetch('/api/auth/lookup-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: cleanStudentId }),
        });

        if (checkRes.ok) {
          // If status is 200, an email was returned, meaning the reg number is already registered
          setErrorMsg(
            'This registration number is already registered. Please sign in or reset your password.'
          );
          setLoading(false);
          return;
        }

        // 2. Call Supabase Auth signUp with metadata
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: cleanFullName,
              student_id: cleanStudentId,
              recovery_email: cleanEmail,
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        if (data?.session) {
          router.push(redirectPath);
          router.refresh();
          return;
        }

        setSuccessMsg(
          'Account created successfully! Please check your email to verify your account before signing in.'
        );
      } else {
        // SIGN-IN FLOW
        if (!cleanStudentId || !cleanPassword) {
          setErrorMsg('Please enter your registration number and password.');
          setLoading(false);
          return;
        }

        // 1. Look up student's email by registration number
        const lookupRes = await fetch('/api/auth/lookup-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: cleanStudentId }),
        });

        if (!lookupRes.ok) {
          // Generic error message to prevent registration number enumeration
          setErrorMsg('Invalid registration number or password.');
          return;
        }

        const lookupData = await lookupRes.json();
        const targetEmail = lookupData?.email;

        if (!targetEmail) {
          setErrorMsg('Invalid registration number or password.');
          return;
        }

        // 2. Sign in with resolved email and password
        const { error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: cleanPassword,
        });

        if (error) {
          setErrorMsg('Invalid registration number or password.');
          return;
        }

        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'A network error occurred. Please try again.');
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
            ? 'Enter your LPU registration number and password to continue.'
            : 'Join the campus community to report and track lost and found items.'}
        </p>
      </div>

      {/* Inline Error Banner */}
      {errorMsg && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[rgba(220,38,38,0.2)] text-xs text-[#DC2626] font-medium"
        >
          {errorMsg}
        </div>
      )}

      {/* Inline Success Banner */}
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
              Full Name <span className="text-[#DC2626]">*</span>
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
            htmlFor="studentId"
            className="block text-xs font-semibold text-[#1C1B18] mb-1.5"
          >
            LPU Registration Number <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="studentId"
            type="text"
            required
            autoCapitalize="characters"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="e.g. 12100001"
            className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FFFFFF] text-sm text-[#1C1B18] placeholder:text-[#A8A49A] rounded-lg border border-[rgba(0,0,0,0.14)] focus:border-[#C96442] focus:ring-2 focus:ring-[#C96442]/15 outline-none transition-colors"
          />
        </div>

        {mode === 'signup' && (
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-[#1C1B18] mb-1.5"
            >
              Personal / Recovery Email <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@gmail.com"
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FFFFFF] text-sm text-[#1C1B18] placeholder:text-[#A8A49A] rounded-lg border border-[rgba(0,0,0,0.14)] focus:border-[#C96442] focus:ring-2 focus:ring-[#C96442]/15 outline-none transition-colors"
            />
            <p className="text-[11px] text-[#6E6B5F] mt-1">
              Used for account recovery and password reset links.
            </p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-[#1C1B18]"
            >
              Password <span className="text-[#DC2626]">*</span>
            </label>
            {mode === 'signin' && (
              <Link
                href="/forgot-password"
                className="text-xs text-[#C96442] hover:underline font-medium min-h-[44px] inline-flex items-center"
              >
                Forgot password?
              </Link>
            )}
          </div>
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
          className="text-xs text-[#A8A49A] hover:text-[#1C1B18] transition-colors min-h-[44px] inline-flex items-center justify-center"
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
