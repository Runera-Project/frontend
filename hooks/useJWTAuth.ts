import { useEffect, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { requestNonce, connectWallet } from '@/lib/api';

/**
 * Custom hook for JWT authentication with backend
 * Automatically authenticates user when wallet is connected
 * Validates JWT token matches current wallet
 */
export function useJWTAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticateWithBackend = async () => {
      if (!address || !isConnected || isAuthenticating) {
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
          const currentWallet = address.toLowerCase();

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
        console.log('📍 Wallet address:', address);

        // Step 1: Request nonce
        const { nonce, message } = await requestNonce({ walletAddress: address });
        console.log('✅ Nonce received:', nonce);

        // Step 2: Sign message
        console.log('✍️ Requesting signature from wallet...');
        const signature = await signMessageAsync({ message });
        console.log('✅ Message signed');

        // Step 3: Connect and get JWT
        console.log('🔗 Connecting to backend...');
        const { token } = await connectWallet({
          walletAddress: address,
          signature,
          message,
          nonce,
        });

        console.log('✅ JWT token received and saved for wallet:', address);
        setIsAuthenticated(true);
        setError(null);
      } catch (err: any) {
        console.error('❌ Backend authentication failed:', err);
        setError(err.message || 'Authentication failed');
        setIsAuthenticated(false);
        // Don't throw - allow user to continue with limited functionality
      } finally {
        setIsAuthenticating(false);
      }
    };

    authenticateWithBackend();
  }, [address, isConnected, signMessageAsync]);

  return {
    isAuthenticating,
    isAuthenticated,
    error,
  };
}
