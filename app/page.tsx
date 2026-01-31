'use client';

import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import Header from '@/components/Header';
import QuestCard from '@/components/QuestCard';
import RecentRun from '@/components/RecentRun';
import BottomNavigation from '@/components/BottomNavigation';
import AuthGuard from '@/components/AuthGuard';
import { ProfileRegistration } from '@/components/ProfileRegistration';
import { useJWTAuth } from '@/hooks/useJWTAuth';
import { useToast } from '@/components/ToastProvider';
import BackendStatus from '@/components/BackendStatus';

export default function Home() {
  const { address } = useAccount();
  const { isAuthenticating, isAuthenticated, error } = useJWTAuth();
  const toast = useToast();

  // Show toast when authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthenticating) {
      toast.success('Connected successfully!', 2000);
    }
  }, [isAuthenticated, isAuthenticating]);

  // Show toast for errors
  useEffect(() => {
    if (error && !isAuthenticating) {
      toast.warning('Some features may be limited', 3000);
    }
  }, [error, isAuthenticating]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f5f7fa]">
        <div className="mx-auto max-w-md pb-28">
          <Header />
          
          {/* Backend Status - Only shows as toast on connect */}
          <BackendStatus />
          
          <QuestCard />
          <RecentRun />
        </div>
        <BottomNavigation activeTab="Home" />
        
        {/* Show profile registration modal if needed */}
        {address && <ProfileRegistration />}
      </div>
    </AuthGuard>
  );
}
