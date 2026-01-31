'use client';

import { Users } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useProfile } from '@/hooks/useProfile';
import { usePrivy } from '@privy-io/react-auth';
import { TIER_COLORS } from '@/lib/contracts';
import { User } from 'lucide-react';

interface ProfilePreviewProps {
  selectedSkin: {
    name: string;
    type: string;
    gradient: string;
  } | null;
}

export default function ProfilePreview({ selectedSkin }: ProfilePreviewProps) {
  const { address } = useAccount();
  const { profile, isLoading } = useProfile(address);
  const { user } = usePrivy();

  // Get username from Privy
  const username = user?.email?.address?.split('@')[0] || user?.wallet?.address?.slice(0, 8) || 'User';
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);
  const walletAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x8F31cB2E90';

  // Get tier gradient from profile
  const tierGradient = profile ? TIER_COLORS[profile.tier as keyof typeof TIER_COLORS] : 'from-yellow-400 to-orange-400';
  
  // Use selected skin gradient or default
  const defaultGradient = 'from-purple-600 via-pink-500 to-red-500';
  const bannerGradient = selectedSkin?.gradient || defaultGradient;

  if (isLoading) {
    return (
      <div className="mx-6 mb-6 overflow-hidden rounded-2xl bg-white shadow-md">
        <div className="h-32 animate-pulse bg-gray-200" />
        <div className="relative px-6 pb-6">
          <div className="relative -mt-12 mb-4 flex justify-center">
            <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200" />
          </div>
          <div className="space-y-2 text-center">
            <div className="mx-auto h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto h-4 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-6 mb-6 overflow-hidden rounded-2xl bg-white shadow-md">
      {/* Banner Background */}
      <div className={`relative h-32 bg-gradient-to-r ${bannerGradient}`}>
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
        </div>
      </div>

      {/* Profile Content */}
      <div className="relative px-6 pb-6">
        {/* Avatar - overlapping banner */}
        <div className="relative -mt-12 mb-4 flex justify-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
            <div className="flex h-full items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="text-center">
          <h3 className="mb-1 text-xl font-bold text-gray-900">{displayName}</h3>
          <p className="mb-4 text-sm text-gray-500">{walletAddress}</p>

          {/* Badges */}
          <div className="flex items-center justify-center gap-2">
            <div className={`inline-flex rounded-full bg-gradient-to-r ${tierGradient} px-6 py-2 text-sm font-bold text-white shadow-md`}>
              {profile?.tierName || 'Bronze'} Runner
            </div>
            {selectedSkin && (
              <div className="inline-flex rounded-full bg-gradient-to-r from-purple-400 to-pink-400 px-6 py-2 text-sm font-bold text-white shadow-md">
                {selectedSkin.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
