'use client';

import { useAccount } from 'wagmi';
import Header from '@/components/Header';
import QuestCard from '@/components/QuestCard';
import RecentRun from '@/components/RecentRun';
import BottomNavigation from '@/components/BottomNavigation';
import AuthGuard from '@/components/AuthGuard';
import { ProfileRegistration } from '@/components/ProfileRegistration';
import { DebugProfile } from '@/components/DebugProfile';
import { useJWTAuth } from '@/hooks/useJWTAuth';

export default function Home() {
  const { address } = useAccount();
  const { isAuthenticating, isAuthenticated, error } = useJWTAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f5f7fa]">
        <div className="mx-auto max-w-md pb-28">
          {/* JWT Authentication Status Banner */}
          {isAuthenticating && (
            <div className="mx-5 mt-5 rounded-xl bg-blue-50 border-2 border-blue-200 p-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                <div>
                  <p className="text-sm font-bold text-blue-900">Authenticating...</p>
                  <p className="text-xs text-blue-700">Please sign the message in your wallet</p>
                </div>
              </div>
            </div>
          )}

          {error && !isAuthenticating && (
            <div className="mx-5 mt-5 rounded-xl bg-yellow-50 border-2 border-yellow-200 p-4">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-bold text-yellow-900">Authentication Warning</p>
                  <p className="text-xs text-yellow-700 mt-1">{error}</p>
                  <p className="text-xs text-yellow-600 mt-2">You can still use the app, but some features may be limited.</p>
                </div>
              </div>
            </div>
          )}

          {isAuthenticated && !isAuthenticating && (
            <div className="mx-5 mt-5 rounded-xl bg-green-50 border-2 border-green-200 p-3">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-xs font-medium text-green-800">Authenticated with backend</p>
              </div>
            </div>
          )}

          <Header />
          <QuestCard />
          <RecentRun />
        </div>
        <BottomNavigation activeTab="Home" />
        
        {/* Show profile registration modal if needed */}
        {address && <ProfileRegistration />}
        
        {/* Debug Panel */}
        <DebugProfile />
      </div>
    </AuthGuard>
  );
}
