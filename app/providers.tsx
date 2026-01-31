"use client";

import { PrivyProvider } from '@privy-io/react-auth';
import { base } from 'viem/chains';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        // Customize Privy's appearance
        appearance: {
          theme: "light",
          accentColor: "#3B82F6",
          logo: undefined,
          landingHeader: "Welcome to Runera",
          loginMessage: "Sign in to track your runs and earn rewards",
        },
        // Login methods - Email, Google, Wallet
        loginMethods: ['email', 'google', 'wallet'],
        // Embedded wallet configuration
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
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
