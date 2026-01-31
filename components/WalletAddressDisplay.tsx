'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Copy, Check, Wallet, Plus } from 'lucide-react';
import { useToast } from './ToastProvider';

export default function WalletAddressDisplay() {
  const { user, createWallet } = usePrivy();
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToast();

  // Handler functions
  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCreateWallet = async () => {
    setIsCreating(true);
    try {
      console.log('🔨 Creating embedded wallet...');
      await createWallet();
      console.log('✅ Embedded wallet created!');
      toast.success('Wallet created successfully!', 2000);
      // Refresh page to show new wallet
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('❌ Failed to create wallet:', error);
      toast.error('Failed to create wallet. Please try again.', 3000);
    } finally {
      setIsCreating(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get wallet address from Privy user
  // Priority: embedded wallet > external wallet
  const getWalletAddress = () => {
    if (!user) {
      console.log('🔍 WalletAddressDisplay: No user logged in');
      return null;
    }

    console.log('🔍 WalletAddressDisplay: Checking for wallet...');
    console.log('User object:', user);
    console.log('Linked accounts:', user.linkedAccounts);
    
    // Debug: Log each account type
    user.linkedAccounts?.forEach((account: any, index: number) => {
      console.log(`Account ${index}:`, {
        type: account.type,
        walletClient: account.walletClient,
        address: account.address,
        full: account
      });
    });

    // Check for embedded wallet first
    const embeddedWallet = user.linkedAccounts?.find(
      (account: any) => account.type === 'wallet' && account.walletClient === 'privy'
    );
    
    if (embeddedWallet) {
      console.log('✅ Found embedded wallet:', embeddedWallet.address);
      return embeddedWallet.address;
    }

    // Check for external wallet (MetaMask, etc)
    const externalWallet = user.linkedAccounts?.find(
      (account: any) => account.type === 'wallet'
    );
    
    if (externalWallet) {
      console.log('✅ Found external wallet:', externalWallet.address);
      return externalWallet.address;
    }

    // Fallback to user.wallet (deprecated but still works)
    if (user.wallet?.address) {
      console.log('✅ Found wallet (deprecated):', user.wallet.address);
      return user.wallet.address;
    }

    console.log('❌ No wallet found');
    console.log('⚠️ User logged in but no wallet created yet');
    return null;
  };

  const walletAddress = getWalletAddress();

  // If no wallet, show create wallet button
  if (!walletAddress && user) {
    console.log('⚠️ WalletAddressDisplay: No wallet, showing create button');
    return (
      <div className="rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 p-4 border border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <Wallet className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-yellow-600 mb-1">No Wallet Yet</p>
              <p className="text-sm font-bold text-yellow-900">
                Create your Web3 wallet
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCreateWallet}
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 text-white font-medium text-sm transition-all hover:bg-yellow-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-yellow-700">
          You need a wallet to interact with blockchain features
        </p>
      </div>
    );
  }

  if (!walletAddress) {
    console.log('⚠️ WalletAddressDisplay: Not rendering (no user or wallet)');
    return null;
  }

  console.log('✅ WalletAddressDisplay: Rendering with address:', walletAddress);

  return (
    <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
            <Wallet className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-blue-600 mb-1">Wallet Address</p>
            <p className="text-sm font-mono font-bold text-blue-900 truncate">
              {formatAddress(walletAddress)}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => handleCopy(walletAddress)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-blue-200 text-blue-600 transition-all hover:bg-blue-50 hover:border-blue-300 active:scale-95 flex-shrink-0 ml-2"
          title="Copy wallet address"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {/* Full address (hidden on mobile, shown on hover) */}
      <div className="mt-2 pt-2 border-t border-blue-100">
        <p className="text-[10px] font-mono text-blue-700 break-all">
          {walletAddress}
        </p>
      </div>
    </div>
  );
}
