'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, formatUnits } from 'viem';
import { CONTRACTS, ABIS, TIER_NAMES } from '@/lib/contracts';
import { requestFaucet } from '@/lib/api';
import { useEffect } from 'react';

export function useProfile(address?: Address) {
  // Check if user has profile
  const { data: hasProfile, isLoading: isCheckingProfile, refetch: refetchHasProfile } = useReadContract({
    address: CONTRACTS.ProfileNFT,
    abi: ABIS.ProfileNFT,
    functionName: 'hasProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Alternative check using balanceOf (ERC721 standard)
  const { data: tokenBalance } = useReadContract({
    address: CONTRACTS.ProfileNFT,
    abi: [
      {
        "type": "function",
        "name": "balanceOf",
        "inputs": [{"name": "owner", "type": "address", "internalType": "address"}],
        "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
        "stateMutability": "view"
      }
    ],
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Use balanceOf as fallback if hasProfile doesn't work
  const hasProfileFallback = tokenBalance !== undefined && tokenBalance > BigInt(0);

  // Log hasProfile status for debugging (only when changed)
  useEffect(() => {
    if (address && hasProfile !== undefined) {
      const logKey = `profile-check-${address}-${hasProfile}`;
      if (!sessionStorage.getItem(logKey)) {
        console.log('Profile Check:', {
          address: address.slice(0, 6) + '...' + address.slice(-4),
          hasProfile,
          tokenBalance: tokenBalance?.toString(),
        });
        sessionStorage.setItem(logKey, 'true');
      }
    }
  }, [address, hasProfile, tokenBalance]);

  // Get profile data (now with correct ABI!)
  const { data: profileData, isLoading: isLoadingProfile, refetch: refetchProfile, error: profileError } = useReadContract({
    address: CONTRACTS.ProfileNFT,
    abi: ABIS.ProfileNFT,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && (hasProfile === true || hasProfileFallback),
    },
  });

  // Get tier from smart contract (already calculated by backend/SC)
  const { data: tierData, refetch: refetchTier } = useReadContract({
    address: CONTRACTS.ProfileNFT,
    abi: ABIS.ProfileNFT,
    functionName: 'getProfileTier',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && (hasProfile === true || hasProfileFallback),
    },
  });

  // Log profile fetch errors (now with correct ABI!)
  useEffect(() => {
    if (profileError && address) {
      console.error('✅ Profile fetch error with NEW ABI:', profileError.message);
      console.error('Check contract address and network. ABI should be correct now.');
    } else if (profileData && address) {
      console.log('✅ Profile data fetched successfully with NEW ABI!');
    }
  }, [profileError, profileData, address]);

  // Register profile
  const { 
    writeContract: register, 
    data: registerHash,
    isPending: isRegistering,
    error: registerError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: registerHash,
  });

  // Log transaction status (only important updates)
  useEffect(() => {
    if (registerHash && isConfirmed) {
      console.log('✅ Profile registered!', `https://sepolia.basescan.org/tx/${registerHash}`);
    }
  }, [registerHash, isConfirmed]);

  // Log errors (only once per session)
  useEffect(() => {
    if (registerError && address) {
      const errorKey = `register-error-${address}`;
      if (!sessionStorage.getItem(errorKey)) {
        console.error('Registration Error:', registerError.message);
        sessionStorage.setItem(errorKey, 'true');
      }
    }
  }, [registerError, address]);

  const registerProfile = async () => {
    try {
      if (!address) {
        return;
      }

      if (hasProfile || hasProfileFallback) {
        console.warn('User already has profile!');
        return;
      }

      try {
        await requestFaucet({ walletAddress: address });
      } catch (error) {
        console.error('Faucet request failed, continuing without subsidy:', error);
      }

      register({
        address: CONTRACTS.ProfileNFT,
        abi: ABIS.ProfileNFT,
        functionName: 'register',
      });
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  // Format profile data (NEW ABI2 structure!)
  // Use tier from smart contract (already calculated by backend)
  const tier = tierData ? Number(tierData) : 1;
  
  const profile = profileData && (profileData as any).exists ? {
    tier: tier,
    tierName: TIER_NAMES[tier as keyof typeof TIER_NAMES] || 'Bronze',
    stats: {
      totalDistance: Number((profileData as any).totalDistanceMeters) / 1000, // meters to km
      totalActivities: Number((profileData as any).runCount),
      totalDuration: 0, // Not in new ABI, set to 0
      currentStreak: 0, // Not in new ABI, set to 0
      longestStreak: Number((profileData as any).longestStreakDays),
      lastActivityTimestamp: Number((profileData as any).lastUpdated),
      level: Number((profileData as any).level),
      xp: Number((profileData as any).xp),
    },
    achievementCount: Number((profileData as any).achievementCount),
    registeredAt: 0, // Not in new ABI
    tokenId: address ? BigInt(address) : BigInt(0), // Token ID is derived from address
  } : null;

  // Use fallback if hasProfile doesn't work OR if balanceOf works
  const finalHasProfile = hasProfile === true || hasProfileFallback === true;

  // If hasProfile is true but profile data is null, create dummy profile
  const finalProfile = profile || (finalHasProfile ? {
    tier: 1,
    tierName: 'Bronze' as const,
    stats: {
      totalDistance: 0,
      totalActivities: 0,
      totalDuration: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityTimestamp: 0,
      level: 1,
      xp: 0,
    },
    achievementCount: 0,
    registeredAt: Date.now() / 1000,
    tokenId: BigInt(0),
  } : null);

  // Log profile data (only once per session)
  useEffect(() => {
    if (finalProfile && address) {
      const logKey = `profile-data-${address}`;
      if (!sessionStorage.getItem(logKey)) {
        console.log('Profile loaded:', {
          tier: finalProfile.tierName,
          distance: finalProfile.stats.totalDistance + ' km',
          activities: finalProfile.stats.totalActivities,
          usingDummyData: !profileData && finalHasProfile,
        });
        sessionStorage.setItem(logKey, 'true');
      }
    }
  }, [finalProfile, address, profileData, finalHasProfile]);

  return {
    hasProfile: finalHasProfile,
    profile: finalProfile,
    isLoading: isCheckingProfile || isLoadingProfile,
    registerProfile,
    isRegistering: isRegistering || isConfirming,
    isConfirmed,
    registerError,
    tokenBalance,
    hasProfileFallback,
    refetch: () => {
      refetchHasProfile();
      refetchProfile();
      refetchTier();
    },
  };
}
