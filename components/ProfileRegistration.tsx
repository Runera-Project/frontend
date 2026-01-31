'use client';

import { useAccount } from 'wagmi';
import { useProfile } from '@/hooks/useProfile';
import { Activity, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ProfileRegistration() {
  const { address } = useAccount();
  const { hasProfile, registerProfile, isRegistering, isConfirmed, registerError, refetch } = useProfile(address);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isWaitingTooLong, setIsWaitingTooLong] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration issue - only render after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Refetch after confirmation and show success
  useEffect(() => {
    if (isConfirmed) {
      console.log('✅ Transaction confirmed! Showing success...');
      setShowSuccess(true);
      // Wait 2 seconds to show success, then refetch
      setTimeout(() => {
        console.log('🔄 Refetching profile...');
        refetch();
      }, 2000);
    }
  }, [isConfirmed, refetch]);

  // Auto-refetch if waiting too long (30 seconds)
  useEffect(() => {
    if (isRegistering) {
      console.log('⏳ Registration in progress...');
      const timer = setTimeout(() => {
        console.log('⚠️ Taking too long, trying to refetch...');
        setIsWaitingTooLong(true);
        refetch();
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    } else {
      setIsWaitingTooLong(false);
    }
  }, [isRegistering, refetch]);

  // Force refetch every 5 seconds while registering
  useEffect(() => {
    if (isRegistering && !isConfirmed) {
      const interval = setInterval(() => {
        console.log('🔄 Polling for profile status...');
        refetch();
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isRegistering, isConfirmed, refetch]);

  // Don't show if already has profile (unless showing success) or not connected
  // Fix hydration: don't render until mounted
  if (!isMounted || !address || (hasProfile && !showSuccess)) {
    console.log('ProfileRegistration: Not showing modal', { isMounted, address: !!address, hasProfile, showSuccess });
    return null;
  }

  console.log('ProfileRegistration: Showing modal', { address, hasProfile });

  // Show success state
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center mb-3">Profile Created! 🎉</h2>
          <p className="text-gray-600 text-center mb-8">
            Your Runera profile NFT has been minted successfully. Loading your profile...
          </p>
          
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

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
        
        {registerError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 mb-1">
                  Transaction Failed
                </p>
                <p className="text-xs text-red-700 mb-2">
                  {registerError.message || 'Failed to create profile. Please try again.'}
                </p>
                <details className="text-xs text-red-600">
                  <summary className="cursor-pointer hover:text-red-800 font-medium">
                    Technical Details
                  </summary>
                  <pre className="mt-2 p-2 bg-red-100 rounded overflow-x-auto text-[10px]">
                    {JSON.stringify(registerError, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        )}

        {isWaitingTooLong && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-900 mb-1">
                  Taking Longer Than Expected
                </p>
                <p className="text-xs text-yellow-700 mb-2">
                  Transaction might be confirmed but we're still checking. Please wait or refresh the page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs text-yellow-800 hover:text-yellow-900 font-medium underline"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={registerProfile}
          disabled={isRegistering}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-full font-semibold text-lg shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isRegistering && <Loader2 className="h-5 w-5 animate-spin" />}
          {isRegistering ? 'Creating Profile...' : 'Create Profile NFT'}
        </button>
        
        {isRegistering && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Waiting for transaction confirmation...
            </p>
            <p className="text-xs text-gray-500">
              This usually takes 10-30 seconds
            </p>
          </div>
        )}
        
        <div className="mt-4 space-y-2">
          <p className="text-xs text-gray-500 text-center">
            This will mint a soulbound NFT to your wallet
          </p>
          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>Network: Base Sepolia Testnet</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>Contract:</span>
            <a
              href={`https://sepolia.basescan.org/address/${process.env.NEXT_PUBLIC_CONTRACT_PROFILE_NFT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {process.env.NEXT_PUBLIC_CONTRACT_PROFILE_NFT?.slice(0, 6)}...
              {process.env.NEXT_PUBLIC_CONTRACT_PROFILE_NFT?.slice(-4)}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
