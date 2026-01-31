'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { createConfig } from 'wagmi';
import { ToastProvider } from '@/components/ToastProvider';

// Wagmi config for Base Sepolia Testnet
const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org'),
  },
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        // Customize Privy's appearance
        appearance: {
          theme: 'light',
          accentColor: '#3B82F6',
          logo: undefined,
          landingHeader: 'Welcome to Runera',
          loginMessage: 'Sign in to track your runs and earn rewards',
        },
        // Login methods - Email, Google, and Wallet
        loginMethods: ['email', 'google', 'wallet'],
        // Embedded wallet configuration - Create for ALL users
        embeddedWallets: {
          createOnLogin: 'all-users', // Create embedded wallet for everyone (Google, Email, Wallet)
          requireUserPasswordOnCreate: false, // Don't require password for embedded wallet
        },
        // Default chain - Base Sepolia Testnet
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        // Wallet configuration
        walletConnectCloudProjectId: undefined,
        // Session persistence - Keep user logged in
        legal: {
          termsAndConditionsUrl: undefined,
          privacyPolicyUrl: undefined,
        },
        // Disable auto-logout on page refresh
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
