import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { requestClaimAchievementSignature } from '@/lib/api';
import { CONTRACTS, ABIS } from '@/lib/contracts';
import { keccak256, toBytes } from 'viem';

/**
 * Convert string to bytes32 hash
 * This is used to convert achievement IDs like "first_5k" to bytes32 format
 */
function stringToBytes32(str: string): `0x${string}` {
  return keccak256(toBytes(str));
}

export function useClaimAchievement() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimAchievement = async (
    achievementId: string,
    tier: number
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert achievement ID to bytes32
      const eventId = stringToBytes32(achievementId);
      
      // Generate metadata hash (can be customized per achievement)
      const metadataHash = keccak256(toBytes(`${achievementId}-${tier}-${address}`));
      
      console.log('=== CLAIM ACHIEVEMENT ===');
      console.log('Achievement ID:', achievementId);
      console.log('Event ID (bytes32):', eventId);
      console.log('Tier:', tier);
      console.log('Metadata Hash:', metadataHash);
      console.log('User Address:', address);

      // 1. Request signature dari backend
      console.log('Requesting claim signature from backend...');
      const { signature, deadline } = await requestClaimAchievementSignature({
        userAddress: address,
        eventId,
        tier,
        metadataHash,
      });

      console.log('Signature received:', signature);
      console.log('Deadline:', deadline);

      // 2. Call smart contract dengan signature
      console.log('Calling claim on contract...');
      const hash = await writeContractAsync({
        address: CONTRACTS.AchievementNFT,
        abi: ABIS.AchievementNFT,
        functionName: 'claim',
        args: [address, eventId, tier, metadataHash, BigInt(deadline), signature],
      });

      console.log('✅ Transaction successful!');
      console.log('Transaction hash:', hash);
      console.log('View on BaseScan:', `https://sepolia.basescan.org/tx/${hash}`);

      setIsLoading(false);
      return { success: true, hash };
    } catch (err: any) {
      console.error('❌ Claim achievement error:', err);
      const errorMessage = err.message || 'Failed to claim achievement';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    claimAchievement,
    isLoading,
    error,
  };
}
