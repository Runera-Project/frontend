import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { requestUpdateStatsSignature, ProfileStats } from '@/lib/api';
import { CONTRACTS, ABIS } from '@/lib/contracts';

export function useUpdateStats() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStats = async (stats: ProfileStats) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Request signature dari backend
      console.log('Requesting signature from backend...');
      const { signature, deadline, stats: verifiedStats } = await requestUpdateStatsSignature({
        userAddress: address,
        stats,
      });

      console.log('Signature received:', signature);
      console.log('Deadline:', deadline);

      // 2. Call smart contract dengan signature
      console.log('Calling updateStats on contract...');
      const hash = await writeContractAsync({
        address: CONTRACTS.ProfileNFT,
        abi: ABIS.ProfileNFT,
        functionName: 'updateStats',
        args: [address, verifiedStats, BigInt(deadline), signature],
      });

      console.log('Transaction hash:', hash);

      setIsLoading(false);
      return { success: true, hash };
    } catch (err: any) {
      console.error('Update stats error:', err);
      const errorMessage = err.message || 'Failed to update stats';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    updateStats,
    isLoading,
    error,
  };
}
