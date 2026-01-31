'use client';

import { useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { useToast } from './ToastProvider';
import Modal from './Modal';
import { useModal } from '@/hooks/useModal';

export default function NetworkGuard() {
  const { chain, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const toast = useToast();
  const modal = useModal();
  const [isSwitching, setIsSwitching] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  useEffect(() => {
    // Only check if user is connected and on wrong network
    if (!isConnected || !chain) return;
    
    // If already on Base Sepolia, do nothing
    if (chain.id === baseSepolia.id) {
      if (hasShownWarning) {
        toast.success('Connected to Base Sepolia', 2000);
        setHasShownWarning(false);
      }
      return;
    }

    // User is on wrong network - just show banner, don't auto-prompt
    if (!hasShownWarning) {
      setHasShownWarning(true);
      // Show toast instead of modal for less intrusive UX
      toast.warning('Please switch to Base Sepolia network', 3000);
    }
  }, [chain, isConnected, hasShownWarning]);

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    try {
      await switchChainAsync({ chainId: baseSepolia.id });
      toast.success('Switched to Base Sepolia!', 2000);
      setHasShownWarning(false);
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      
      // If user rejected, just show toast
      if (error.message?.includes('rejected') || error.message?.includes('denied')) {
        toast.info('Please switch to Base Sepolia manually in your wallet', 4000);
      } else {
        // Show detailed instructions in modal only if there's an actual error
        modal.info(
          'Add Base Sepolia Network',
          'Please add Base Sepolia to your wallet:\n\n• Network Name: Base Sepolia\n• RPC URL: https://sepolia.base.org\n• Chain ID: 84532\n• Currency: ETH\n\nThen switch to it manually.'
        );
      }
    } finally {
      setIsSwitching(false);
    }
  };

  // Show persistent warning banner if on wrong network
  if (isConnected && chain && chain.id !== baseSepolia.id) {
    return (
      <div key="network-guard-wrapper">
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-4 shadow-xl">
          <div className="max-w-md mx-auto">
            <div className="flex items-start gap-3 mb-3">
              <svg className="h-6 w-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold mb-1">Wrong Network</p>
                <p className="text-sm opacity-95 mb-1">Currently on: {chain.name}</p>
                <p className="text-xs opacity-90">This app requires Base Sepolia Testnet</p>
              </div>
            </div>
            <button
              onClick={handleSwitchNetwork}
              disabled={isSwitching}
              className="w-full px-4 py-3 bg-white text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-all disabled:opacity-50 shadow-lg"
            >
              {isSwitching ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Switching...
                </span>
              ) : (
                'Switch to Base Sepolia'
              )}
            </button>
          </div>
        </div>
        
        {/* Spacer to prevent content from being hidden under banner */}
        <div className="h-32" />
        
        {/* Modal */}
        {modal.isOpen && (
          <Modal
            isOpen={modal.isOpen}
            onClose={modal.closeModal}
            title={modal.config.title}
            message={modal.config.message}
            type={modal.config.type}
            confirmText={modal.config.confirmText}
            cancelText={modal.config.cancelText}
            onConfirm={modal.config.onConfirm}
            showCancel={modal.config.showCancel}
          />
        )}
      </div>
    );
  }

  return (
    <>
      {modal.isOpen && (
        <Modal
          isOpen={modal.isOpen}
          onClose={modal.closeModal}
          title={modal.config.title}
          message={modal.config.message}
          type={modal.config.type}
          confirmText={modal.config.confirmText}
          cancelText={modal.config.cancelText}
          onConfirm={modal.config.onConfirm}
          showCancel={modal.config.showCancel}
        />
      )}
    </>
  );
}
