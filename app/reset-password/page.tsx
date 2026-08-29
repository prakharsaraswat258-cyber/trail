'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';

function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Check if recovery session is active or set from URL hash
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          if (session) {
            setHasValidSession(true);
          }
          setSessionChecking(false);
        }
      } catch {
        if (mounted) {
          setSessionChecking(false);
        }
      }
    };

    checkSession();

    // Listen for PASSWORD_RECOVERY or SIGNED_IN auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
          setHasValidSession(true);
          setSessionChecking(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setSuccess(true);
      // Optional: automatically redirect to login after a brief delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update password. Please try again.');
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
          Set New Password
        </h1>
        <p className="text-xs text-[#6E6B5F]">
          Create a new, strong password for your account.
        </p>
      </div>

      {/* Error notification */}
      {errorMsg && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[rgba(220,38,38,0.2)] text-xs text-[#DC2626] font-medium"
        >
          {errorMsg}
        </div>
      )}

      {sessionChecking ? (
        <div className="text-center py-6 text-xs text-[#6E6B5F]">
          Verifying security link...
        </div>
      ) : success ? (
        <div className="space-y-5">
          <div
            role="status"
            className="p-4 rounded-lg bg-[#ECFDF5] border border-[rgba(5,150,105,0.2)] text-xs text-[#059669] font-medium leading-relaxed"
          >
            Your password has been successfully updated! Redirecting to sign in...
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="w-full min-h-[44px] px-6 py-3 rounded-lg bg-[#C96442] hover:bg-[#B5572E] active:bg-[#9E4622] text-[#FFFFFF] text-sm font-semibold transition-colors flex items-center justify-center text-center select-none"
            >
              Go to Sign in
            </Link>
          </div>
        </div>
      ) : !hasValidSession ? (
        <div className="space-y-5">
          <div
            role="alert"
            className="p-4 rounded-lg bg-[#FEF2F2] border border-[rgba(220,38,38,0.2)] text-xs text-[#DC2626] font-medium leading-relaxed"
          >
            The password reset link is invalid or has expired. Please request a new recovery link.
          </div>
          <div className="pt-2">
            <Link
              href="/forgot-password"
              className="w-full min-h-[44px] px-6 py-3 rounded-lg bg-[#C96442] hover:bg-[#B5572E] active:bg-[#9E4622] text-[#FFFFFF] text-sm font-semibold transition-colors flex items-center justify-center text-center select-none"
            >
              Request New Link
            </Link>
          </div>
          <div className="text-center">
            <Link
              href="/login"
              className="text-xs text-[#6E6B5F] hover:text-[#1C1B18] transition-colors min-h-[44px] inline-flex items-center justify-center font-medium"
            >
              ← Back to Sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-xs font-semibold text-[#1C1B18] mb-1.5"
            >
              New Password <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="newPassword"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FFFFFF] text-sm text-[#1C1B18] placeholder:text-[#A8A49A] rounded-lg border border-[rgba(0,0,0,0.14)] focus:border-[#C96442] focus:ring-2 focus:ring-[#C96442]/15 outline-none transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-[#1C1B18] mb-1.5"
            >
              Confirm New Password <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Updating password...' : 'Update Password'}
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
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F3] text-[#1C1B18] flex items-center justify-center p-4 font-sans">
      <Suspense fallback={<div className="text-xs text-[#6E6B5F]">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
