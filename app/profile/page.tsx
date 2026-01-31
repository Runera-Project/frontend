'use client';

import { useAccount } from 'wagmi';
import { useProfile } from '@/hooks/useProfile';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileIdentityCard from '@/components/profile/ProfileIdentityCard';
import RankProgressCard from '@/components/profile/RankProgressCard';
import StatsOverview from '@/components/profile/StatsOverview';
import AchievementsSection from '@/components/profile/AchievementsSection';
import BottomNavigation from '@/components/BottomNavigation';
import AuthGuard from '@/components/AuthGuard';
import { ProfileRegistration } from '@/components/ProfileRegistration';
import WalletAddressDisplay from '@/components/WalletAddressDisplay';
import { useEffect, useState } from 'react';
import { AlertTriangle, User } from 'lucide-react';

export default function ProfilePage() {
  const { address } = useAccount();
  const { profile, isLoading, hasProfile } = useProfile(address);
  const [hasError, setHasError] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('=== Profile Page Debug ===');
    console.log('Address:', address);
    console.log('isLoading:', isLoading);
    console.log('hasProfile:', hasProfile);
    console.log('profile:', profile);
    console.log('Will show profile UI:', !isLoading && (profile || hasProfile));
    
    // Check which branch will render
    if (isLoading) {
      console.log('→ Rendering: LOADING STATE');
    } else if (profile || hasProfile) {
      console.log('→ Rendering: PROFILE UI');
      console.log('→ Profile data:', profile);
    } else {
      console.log('→ Rendering: NO PROFILE');
    }
  }, [address, isLoading, hasProfile, profile]);

  // Error boundary
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Profile page error:', event.error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // TODO: Get selected banner skin from cosmetic NFT
  const selectedBannerGradient = 'from-purple-600 via-pink-500 to-red-500';

  // Show error state
  if (hasError) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#f5f7fa]">
          <div className="mx-auto max-w-md pb-28">
            <ProfileHeader />
            <div className="px-5 py-12">
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertTriangle className="h-7 w-7 text-yellow-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">Something went wrong</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Unable to load profile. Please refresh the page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
          <BottomNavigation activeTab="User" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f5f7fa]">
        <div className="mx-auto max-w-md pb-28">
          <ProfileHeader />
          
          {isLoading ? (
            <div className="px-5 space-y-4">
              <div className="animate-pulse bg-white rounded-2xl h-48" />
              <div className="animate-pulse bg-white rounded-2xl h-32" />
              <div className="animate-pulse bg-white rounded-2xl h-48" />
            </div>
          ) : (profile || hasProfile) ? (
            // Show profile UI with real data OR dummy data if ABI mismatch
            <>
              {console.log('=== Rendering Profile UI ===')}
              {!profile && hasProfile && (
                <div className="mx-6 mb-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center justify-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-700" />
                    <p className="text-xs text-yellow-700">
                      Using dummy data due to ABI mismatch
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {(() => {
                  try {
                    const profileData = profile || {
                      tier: 1,
                      tierName: 'Bronze',
                      stats: {
                        totalDistance: 0,
                        totalActivities: 0,
                        totalDuration: 0,
                        currentStreak: 0,
                        longestStreak: 0,
                        lastActivityTimestamp: 0,
                      },
                      registeredAt: Date.now() / 1000,
                      tokenId: BigInt(0),
                    };
                    
                    console.log('Rendering ProfileIdentityCard with:', profileData);
                    return (
                      <>
                        <ProfileIdentityCard 
                          bannerGradient={selectedBannerGradient}
                          profile={profileData}
                        />
                        {/* Wallet Address Display - Works for all login methods */}
                        <div className="px-5">
                          <WalletAddressDisplay />
                        </div>
                        <RankProgressCard profile={profileData} />
                        <StatsOverview profile={profileData} />
                        <AchievementsSection />
                      </>
                    );
                  } catch (error) {
                    console.error('Error rendering profile components:', error);
                    return (
                      <div className="mx-6">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                          <div className="mb-2 flex justify-center">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                          </div>
                          <p className="text-sm font-semibold text-red-900">Component Error</p>
                          <p className="text-xs text-red-600 mt-1">{String(error)}</p>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            </>
          ) : (
            <div className="px-5 py-12">
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-7 w-7 text-gray-400" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">No Profile Found</h3>
                <p className="text-sm text-gray-600">
                  Create your profile to get started
                </p>
              </div>
            </div>
          )}
        </div>
        <BottomNavigation activeTab="User" />
        
        {/* Show profile registration modal ONLY if no profile */}
        {address && !hasProfile && !profile && <ProfileRegistration />}
      </div>
    </AuthGuard>
  );
}
