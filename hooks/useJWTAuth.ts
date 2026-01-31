import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { requestNonce, connectWallet } from '@/lib/api';

/**
 * Custom hook for JWT authentication with backend
 * Automatically authenticates user when wallet is connected
 * Validates JWT token matches current wallet
 * Supports embedded wallets (Google/Email login) and external wallets (MetaMask)
 */
export function useJWTAuth() {
  const { address } = useAccount();
  const { user, ready, authenticated } = usePrivy();
  const { wallets } = useWallets(); // Get all wallets (embedded + external)
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get wallet address from either wagmi (external) or Privy (embedded)
  const getWalletAddress = () => {
    // Priority 1: wagmi address (external wallet like MetaMask)
    if (address) return address;

    // Priority 2: Privy embedded wallet
    if (user?.linkedAccounts) {
      const embeddedWallet = user.linkedAccounts.find(
        (account: any) => account.type === 'wallet' && account.walletClient === 'privy'
      );
      if (embeddedWallet) return embeddedWallet.address;

      // Fallback: any wallet
      const anyWallet = user.linkedAccounts.find(
        (account: any) => account.type === 'wallet'
      );
      if (anyWallet) return anyWallet.address;
    }

    // Priority 3: Deprecated user.wallet
    return user?.wallet?.address || null;
  };

  const walletAddress = getWalletAddress();

  useEffect(() => {
    const authenticateWithBackend = async () => {
      // Wait for Privy to be ready and wallets to be loaded
      if (!walletAddress || isAuthenticating || !ready || !authenticated || wallets.length === 0) {
        setIsAuthenticated(false);
        return;
      }

      // Check if already have token for THIS wallet
      const existingToken = localStorage.getItem('runera_token');
      if (existingToken) {
        // Decode token to check if it's for the current wallet
        try {
          const payload = JSON.parse(atob(existingToken.split('.')[1]));
          const tokenWallet = payload.walletAddress?.toLowerCase();
          const currentWallet = walletAddress.toLowerCase();

          // Check if token is expired
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < now) {
            console.warn('⚠️ JWT token expired, clearing...');
            localStorage.removeItem('runera_token');
          } else if (tokenWallet === currentWallet) {
            console.log('✅ Already have valid JWT token for current wallet');
            setIsAuthenticated(true);
            setError(null);
            return;
          } else {
            console.warn('⚠️ JWT token is for different wallet, clearing...');
            console.log('Token wallet:', tokenWallet);
            console.log('Current wallet:', currentWallet);
            localStorage.removeItem('runera_token');
          }
        } catch (err) {
          console.error('Failed to decode JWT token:', err);
          localStorage.removeItem('runera_token');
        }
      }

      // Need to authenticate
      setIsAuthenticating(true);
      setError(null);

      try {
        console.log('🔐 Starting JWT authentication...');
        console.log('📍 Wallet address:', walletAddress);

        // Step 1: Request nonce
        console.log('📡 Requesting nonce from backend...');
        const { nonce, message } = await requestNonce({ walletAddress });
        console.log('✅ Nonce received:', nonce);
        console.log('📝 Message to sign:', message);

        // Step 2: Sign message with wallet
        console.log('✍️ Requesting signature from wallet...');
        console.log('Available wallets:', wallets.length);
        
        // Find the wallet to use for signing
        const wallet = wallets.find(w => w.address.toLowerCase() === walletAddress.toLowerCase());
        
        if (!wallet) {
          console.error('❌ Wallet not found!');
          console.log('Looking for:', walletAddress);
          console.log('Available wallets:', wallets.map(w => ({ address: w.address, type: w.walletClientType })));
          throw new Error('Wallet not found for signing');
        }
        
        console.log('✅ Found wallet:', { address: wallet.address, type: wallet.walletClientType });
        
        // Use Privy's wallet provider to sign
        let signature: string;
        try {
          // Get the wallet provider (EIP-1193 provider)
          const provider = await wallet.getEthereumProvider();
          console.log('✅ Got Ethereum provider');
          console.log('📝 Message to sign:', message);
          
          // Sign message using personal_sign (standard for message signing)
          // Note: personal_sign params are [message, address]
          // The message can be passed as plain text or hex - the provider will handle it
          signature = await provider.request({
            method: 'personal_sign',
            params: [message, walletAddress],
          }) as string;
          
          console.log('✅ Message signed successfully');
          console.log('✅ Signature:', signature.substring(0, 20) + '...');
        } catch (signError: any) {
          console.error('❌ Signing failed:', signError);
          console.error('Error details:', signError);
          throw new Error(`Failed to sign message: ${signError.message || 'Unknown error'}`);
        }

        // Step 3: Connect and get JWT
        console.log('🔗 Connecting to backend...');
        const { token } = await connectWallet({
          walletAddress,
          signature,
          message,
          nonce,
        });

        console.log('✅ JWT token received and saved for wallet:', walletAddress);
        setIsAuthenticated(true);
        setError(null);
      } catch (err: any) {
        // Silent error handling - don't spam console
        const errorMessage = err.message || 'Authentication failed';
        
        // Only log critical errors, not network errors
        if (!errorMessage.includes('fetch') && !errorMessage.includes('NetworkError')) {
          console.error('❌ Backend authentication failed:', err);
        }
        
        // Parse error message for user
        let userMessage = 'Authentication failed';
        if (errorMessage.includes('Failed to create nonce') || errorMessage.includes('database')) {
          userMessage = 'Backend database error';
        } else if (errorMessage.includes('fetch') || errorMessage.includes('NetworkError')) {
          userMessage = 'Backend offline';
          // Don't set error state for network errors - backend might be down temporarily
          setError(null);
          setIsAuthenticated(false);
          setIsAuthenticating(false);
          return;
        } else if (errorMessage.includes('Signature') || errorMessage.includes('signature')) {
          userMessage = 'Signature verification failed';
        } else if (errorMessage.includes('Nonce')) {
          userMessage = 'Authentication session expired';
        } else if (errorMessage.includes('Wallet')) {
          userMessage = 'Wallet error';
        }
        
        setError(userMessage);
        setIsAuthenticated(false);
        // Don't throw - allow user to continue with limited functionality
      } finally {
        setIsAuthenticating(false);
      }
    };

    authenticateWithBackend();
  }, [walletAddress, wallets, ready, user]);

  return {
    isAuthenticating,
    isAuthenticated,
    error,
  };
}
