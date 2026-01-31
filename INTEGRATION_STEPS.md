# Smart Contract Integration - Step by Step

## 🚀 Quick Start Integration

### Step 1: Update Privy Provider untuk Wagmi

```typescript
// app/providers.tsx
'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { base } from 'viem/chains';
import { createConfig } from 'wagmi';

// Wagmi config
const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#3B82F6',
          landingHeader: 'Welcome to Runera',
          loginMessage: 'Sign in to track your runs and earn rewards',
        },
        loginMethods: ['email', 'google', 'wallet'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        defaultChain: base,
        supportedChains: [base],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
```

### Step 2: Create Contract Config

```typescript
// lib/contracts.ts
import { Address } from 'viem';

// Contract Addresses (Update with actual deployed addresses)
export const CONTRACTS = {
  ProfileNFT: (process.env.NEXT_PUBLIC_CONTRACT_PROFILE_NFT || '0x0') as Address,
  CosmeticNFT: (process.env.NEXT_PUBLIC_CONTRACT_COSMETIC_NFT || '0x0') as Address,
  AchievementNFT: (process.env.NEXT_PUBLIC_CONTRACT_ACHIEVEMENT_NFT || '0x0') as Address,
  EventRegistry: (process.env.NEXT_PUBLIC_CONTRACT_EVENT_REGISTRY || '0x0') as Address,
  Marketplace: (process.env.NEXT_PUBLIC_CONTRACT_MARKETPLACE || '0x0') as Address,
} as const;

// Import ABIs dari ABI2 (GUNAKAN INI!)
import ProfileABI from '@/ABI2/RuneraProfileABI.json';
import CosmeticABI from '@/ABI2/RuneraCosmeticNFTABI.json';
import AchievementABI from '@/ABI2/RuneraAchievementABI.json';
import EventABI from '@/ABI2/RuneraEventRegistryABI.json';
import MarketplaceABI from '@/ABI2/RuneraMarketplaceABI.json';

export const ABIS = {
  ProfileNFT: ProfileABI,
  CosmeticNFT: CosmeticABI,
  AchievementNFT: AchievementABI,
  EventRegistry: EventABI,
  Marketplace: MarketplaceABI,
} as const;

// Tier configuration
export const TIER_NAMES = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
  5: 'Diamond',
} as const;

export const TIER_REQUIREMENTS = {
  1: 0,      // Bronze - default
  2: 50,     // Silver - 50km
  3: 200,    // Gold - 200km
  4: 500,    // Platinum - 500km
  5: 1000,   // Diamond - 1000km
} as const;

export const TIER_COLORS = {
  1: 'from-amber-700 to-amber-900',   // Bronze
  2: 'from-gray-400 to-gray-600',     // Silver
  3: 'from-yellow-400 to-yellow-600', // Gold
  4: 'from-cyan-400 to-cyan-600',     // Platinum
  5: 'from-blue-400 to-purple-600',   // Diamond
} as const;
```

### Step 3: Create Profile Hook

```typescript
// hooks/useProfile.ts
'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, formatUnits } from 'viem';
import { CONTRACTS, ABIS, TIER_NAMES } from '@/lib/contracts';

export function useProfile(address?: Address) {
  // Check if user has profile
  const { data: hasProfile, isLoading: isCheckingProfile } = useReadContract({
    address: CONTRACTS.ProfileNFT,
    abi: ABIS.ProfileNFT,
    functionName: 'hasProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Get profile data
  const { data: profileData, isLoading: isLoadingProfile } = useReadContract({
    address: CONTRACTS.ProfileNFT,
    abi: ABIS.ProfileNFT,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && hasProfile === true,
    },
  });

  // Register profile
  const { 
    writeContract: register, 
    data: registerHash,
    isPending: isRegistering 
  } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: registerHash,
  });

  const registerProfile = () => {
    register({
      address: CONTRACTS.ProfileNFT,
      abi: ABIS.ProfileNFT,
      functionName: 'register',
    });
  };

  // Format profile data
  const profile = profileData ? {
    tier: Number(profileData.tier),
    tierName: TIER_NAMES[Number(profileData.tier) as keyof typeof TIER_NAMES],
    stats: {
      totalDistance: Number(formatUnits(profileData.stats.totalDistance, 3)), // meters to km
      totalActivities: Number(profileData.stats.totalActivities),
      totalDuration: Number(profileData.stats.totalDuration), // seconds
      currentStreak: Number(profileData.stats.currentStreak),
      longestStreak: Number(profileData.stats.longestStreak),
      lastActivityTimestamp: Number(profileData.stats.lastActivityTimestamp),
    },
    registeredAt: Number(profileData.registeredAt),
    tokenId: profileData.tokenId,
  } : null;

  return {
    hasProfile,
    profile,
    isLoading: isCheckingProfile || isLoadingProfile,
    registerProfile,
    isRegistering: isRegistering || isConfirming,
  };
}
```

### Step 4: Create Profile Registration Component

```typescript
// components/ProfileRegistration.tsx
'use client';

import { useAccount } from 'wagmi';
import { useProfile } from '@/hooks/useProfile';
import { Activity } from 'lucide-react';

export function ProfileRegistration() {
  const { address } = useAccount();
  const { hasProfile, registerProfile, isRegistering } = useProfile(address);

  // Don't show if already has profile or not connected
  if (!address || hasProfile) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Activity className="h-10 w-10 text-white" strokeWidth={2.5} />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center mb-3">Create Your Profile</h2>
        <p className="text-gray-600 text-center mb-8">
          Create your Runera profile NFT to start tracking your runs and earning rewards on Base!
        </p>
        
        <button
          onClick={registerProfile}
          disabled={isRegistering}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-full font-semibold text-lg shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRegistering ? 'Creating Profile...' : 'Create Profile NFT'}
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          This will mint a soulbound NFT to your wallet
        </p>
      </div>
    </div>
  );
}
```

### Step 5: Add to Main Layout

```typescript
// app/page.tsx
'use client';

import { useAccount } from 'wagmi';
import Header from '@/components/Header';
import QuestCard from '@/components/QuestCard';
import ActivityFeed from '@/components/ActivityFeed';
import BottomNavigation from '@/components/BottomNavigation';
import AuthGuard from '@/components/AuthGuard';
import { ProfileRegistration } from '@/components/ProfileRegistration';

export default function Home() {
  const { address } = useAccount();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f5f7fa]">
        <div className="mx-auto max-w-md pb-28">
          <Header />
          <QuestCard />
          <ActivityFeed />
        </div>
        <BottomNavigation activeTab="Home" />
        
        {/* Show profile registration modal if needed */}
        {address && <ProfileRegistration />}
      </div>
    </AuthGuard>
  );
}
```

### Step 6: Display Profile Stats

```typescript
// components/profile/ProfileStatsCard.tsx
'use client';

import { useAccount } from 'wagmi';
import { useProfile } from '@/hooks/useProfile';
import { TIER_COLORS } from '@/lib/contracts';

export function ProfileStatsCard() {
  const { address } = useAccount();
  const { profile, isLoading } = useProfile(address);

  if (isLoading) {
    return <div className="animate-pulse bg-white rounded-2xl p-6 h-48" />;
  }

  if (!profile) {
    return <div className="bg-white rounded-2xl p-6">No profile found</div>;
  }

  const tierGradient = TIER_COLORS[profile.tier as keyof typeof TIER_COLORS];

  return (
    <div className="space-y-4">
      {/* Tier Badge */}
      <div className={`bg-gradient-to-r ${tierGradient} rounded-2xl p-6 text-white`}>
        <div className="text-sm font-medium opacity-90">Current Tier</div>
        <div className="text-3xl font-bold">{profile.tierName}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">
            {profile.stats.totalDistance.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Total KM</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">
            {profile.stats.totalActivities}
          </div>
          <div className="text-xs text-gray-500 mt-1">Activities</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">
            {profile.stats.currentStreak}
          </div>
          <div className="text-xs text-gray-500 mt-1">Day Streak</div>
        </div>
      </div>

      {/* Duration & Longest Streak */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-900">
            {Math.floor(profile.stats.totalDuration / 3600)}h
          </div>
          <div className="text-xs text-gray-500 mt-1">Total Time</div>
        </div>
        
        <div className="bg-white rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-900">
            {profile.stats.longestStreak}
          </div>
          <div className="text-xs text-gray-500 mt-1">Longest Streak</div>
        </div>
      </div>
    </div>
  );
}
```

### Step 7: Update Environment Variables

```bash
# .env.local

# Privy (existing)
NEXT_PUBLIC_PRIVY_APP_ID=cmky60ltc00vpl80cuca2k36w
PRIVY_APP_SECRET=privy_app_secret_...

# Smart Contract Addresses (Base Mainnet)
# TODO: Update with actual deployed contract addresses
NEXT_PUBLIC_CONTRACT_PROFILE_NFT=0x...
NEXT_PUBLIC_CONTRACT_COSMETIC_NFT=0x...
NEXT_PUBLIC_CONTRACT_ACHIEVEMENT_NFT=0x...
NEXT_PUBLIC_CONTRACT_EVENT_REGISTRY=0x...
NEXT_PUBLIC_CONTRACT_MARKETPLACE=0x...
```

---

## 🧪 Testing Checklist

### Test Profile Registration
- [ ] Connect wallet
- [ ] Modal appears if no profile
- [ ] Click "Create Profile NFT"
- [ ] Transaction confirms
- [ ] Modal disappears
- [ ] Profile data loads

### Test Profile Display
- [ ] Profile stats show correctly
- [ ] Tier badge displays
- [ ] Stats update after activity
- [ ] Tier upgrades when threshold reached

---

## 🚨 Common Issues & Solutions

### Issue: "Contract not found"
**Solution**: Update contract addresses in `.env.local`

### Issue: "Transaction reverted"
**Solution**: Check if user already has profile with `hasProfile()`

### Issue: "Signature verification failed"
**Solution**: Ensure backend signer address has BACKEND_SIGNER_ROLE

### Issue: "Stats not updating"
**Solution**: Check backend signature is valid and not expired

---

## 📚 Next Integration Steps

After Profile System:
1. **Cosmetics System** - Display owned items, equip/unequip
2. **Marketplace** - Browse and buy cosmetics
3. **Achievements** - Display and claim achievements
4. **Events** - Show events and join functionality

See `SMART_CONTRACT_ANALYSIS.md` for detailed contract documentation.

---

**Last Updated**: January 29, 2025  
**Status**: Ready to Implement  
**Estimated Time**: 2-3 hours for basic profile integration
