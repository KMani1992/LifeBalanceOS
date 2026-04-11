'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

/**
 * OAuth Callback Page
 * 
 * Handles the OAuth redirect from Supabase. When the user is redirected back
 * from the OAuth provider, this page:
 * 1. Checks for auth tokens in the URL hash (client-side)
 * 2. Waits for the auth context to establish the session
 * 3. Redirects to dashboard on success or auth page on error
 */
export default function AuthCallback() {
  const router = useRouter();
  const { user, isInitializing, authError } = useAuth();
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    // Check if we have auth data in the URL
    const hash = window.location.hash;
    const hasAuthToken = hash.includes('access_token') || hash.includes('code');

    // If auth context is done initializing, check the result
    if (!isInitializing) {
      // User is authenticated - go to dashboard
      if (user) {
        router.replace('/dashboard');
        return;
      }

      // If there's an auth error and we've waited long enough, show error
      if (authError && checkCount > 2) {
        router.replace(`/auth?error=${encodeURIComponent(authError)}`);
        return;
      }

      // If we have auth tokens in the hash, give the auth context more time to process
      if (hasAuthToken && checkCount < 3) {
        const timer = setTimeout(() => {
          setCheckCount(prev => prev + 1);
        }, 1000);
        return () => clearTimeout(timer);
      }

      // If no user, no error, but we had auth tokens - likely still processing
      if (hasAuthToken && checkCount <= 3) {
        const timer = setTimeout(() => {
          setCheckCount(prev => prev + 1);
        }, 1500);
        return () => clearTimeout(timer);
      }

      // No auth tokens and no user - authentication failed
      if (!hasAuthToken && checkCount > 1) {
        router.replace('/auth?error=Authentication%20failed');
      }
    }
  }, [isInitializing, user, authError, checkCount, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-blue-100">
          <svg className="w-6 h-6 text-blue-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-gray-600">Completing sign in...</p>
        <p className="text-sm text-gray-400 mt-2">This should only take a few seconds</p>
      </div>
    </div>
  );
}
