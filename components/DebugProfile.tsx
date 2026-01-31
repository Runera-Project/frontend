'use client';

import { useAccount } from 'wagmi';
import { useProfile } from '@/hooks/useProfile';
import { useState } from 'react';
import { CONTRACTS } from '@/lib/contracts';
import { useToast } from './ToastProvider';

export function DebugProfile() {
  const { address } = useAccount();
  const { hasProfile, profile, isLoading, tokenBalance, hasProfileFallback } = useProfile(address);
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);

  if (!address) return null;

  return (
    <>
      {/* Debug Button - Fixed bottom right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-32 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-700 text-sm font-semibold"
      >
        🐛 Debug
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Debug Profile Status</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Wallet Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Wallet Info</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Address:</span>
                    <div className="font-mono text-xs break-all bg-white p-2 rounded mt-1">
                      {address}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">Short:</span>
                    <span className="ml-2 font-mono">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contract Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Contract Info</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Profile NFT Contract:</span>
                    <div className="font-mono text-xs break-all bg-white p-2 rounded mt-1">
                      {CONTRACTS.ProfileNFT}
                    </div>
                  </div>
                  <a
                    href={`https://sepolia.basescan.org/address/${CONTRACTS.ProfileNFT}#readContract`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-blue-600 hover:text-blue-800 underline"
                  >
                    View on BaseScan (Sepolia) →
                  </a>
                </div>
              </div>

              {/* Profile Status */}
              <div className={`p-4 rounded-lg ${hasProfile ? 'bg-green-50' : 'bg-red-50'}`}>
                <h3 className="font-bold text-lg mb-2">Profile Status</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Has Profile (hasProfile):</span>
                    <span className={`ml-2 font-bold ${hasProfile ? 'text-green-600' : 'text-red-600'}`}>
                      {isLoading ? 'Loading...' : hasProfile ? '✅ TRUE' : '❌ FALSE'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Token Balance (balanceOf):</span>
                    <span className="ml-2 font-mono">
                      {tokenBalance !== undefined ? tokenBalance.toString() : 'Loading...'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Has Profile (Fallback):</span>
                    <span className={`ml-2 font-bold ${hasProfileFallback ? 'text-green-600' : 'text-red-600'}`}>
                      {hasProfileFallback ? '✅ TRUE' : '❌ FALSE'}
                    </span>
                  </div>
                  {hasProfile && profile && (
                    <>
                      <div>
                        <span className="font-semibold">Tier:</span>
                        <span className="ml-2">{profile.tier} - {profile.tierName}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Token ID:</span>
                        <span className="ml-2">{profile.tokenId.toString()}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Total Distance:</span>
                        <span className="ml-2">{profile.stats.totalDistance} km</span>
                      </div>
                      <div>
                        <span className="font-semibold">Total Activities:</span>
                        <span className="ml-2">{profile.stats.totalActivities}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Manual Check Instructions */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Manual Check on BaseScan</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    <a
                      href={`https://sepolia.basescan.org/address/${CONTRACTS.ProfileNFT}#readContract`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Open contract on BaseScan Sepolia
                    </a>
                  </li>
                  <li>Find function "hasProfile"</li>
                  <li>
                    Enter your address:
                    <div className="font-mono text-xs bg-white p-2 rounded mt-1 break-all">
                      {address}
                    </div>
                  </li>
                  <li>Click "Query"</li>
                  <li>Check if result is true or false</li>
                </ol>
              </div>

              {/* Check Transaction */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Check Your Transactions</h3>
                <a
                  href={`https://sepolia.basescan.org/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  View your transactions on BaseScan Sepolia →
                </a>
                <p className="text-xs text-gray-600 mt-2">
                  Look for "Register" transaction to Profile NFT contract
                </p>
              </div>

              {/* Possible Issues */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Possible Issues</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>ABI file is placeholder (not real contract ABI)</li>
                  <li>Contract address is wrong</li>
                  <li>Using different wallet address</li>
                  <li>Transaction failed but not detected</li>
                  <li>Network issue (not on Base)</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(address);
                    toast.success('Address copied!', 2000);
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 font-semibold"
                >
                  Copy Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
