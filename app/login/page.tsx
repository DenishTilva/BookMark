'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const origin = window.location.origin;

      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex w-full max-w-md flex-col items-center justify-center">
      <div className="w-full rounded-xl border border-border bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-semibold">
          Smart Bookmark App
        </h1>
        <p className="mb-6 text-center text-sm text-muted">
          Save and sync your bookmarks in real time.
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            Authentication error. Please try again.
          </div>
        )}

        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>
      </div>
    </main>
  );
}

