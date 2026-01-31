# Solusi Gasless Profile NFT untuk User Baru

## ✅ Bug Fixed
Fixed `lib/api.ts` error: "error is not defined" → Changed to use `errorMessage`

## 🎯 Problem
User baru yang login dengan Google/Email tidak punya ETH Base Sepolia untuk:
1. Register Profile NFT (call `register()`)
2. Mint Achievement NFT
3. Submit transactions lainnya

## 💡 Solusi: Backend-Sponsored Transactions

Backend akan melakukan transaksi blockchain untuk user baru secara GASLESS (gratis untuk user).

### Cara Kerja

```
User Login → JWT Auth → Backend Check Profile → Backend Register Profile (GASLESS) → Done!
```

## 📝 Implementation

### 1. Backend: Auto-Register Profile Endpoint

Tambahkan ke `Backend/src/server.js`:

```javascript
/**
 * Auto-register Profile NFT for new users (GASLESS)
 * POST /profile/auto-register
 */
app.post("/profile/auto-register", async (req, res) => {
  const authUser = await getUserFromAuthHeader(req);
  
  if (!authUser) {
    return res.status(401).json({
      error: { code: "ERR_UNAUTHORIZED", message: "Authentication required" },
    });
  }

  // Check if already registered
  if (authUser.profileTokenId !== null) {
    return res.json({
      success: true,
      alreadyRegistered: true,
      message: "Profile already registered",
    });
  }

  // Check backend configuration
  if (!process.env.BACKEND_SIGNER_PRIVATE_KEY || !process.env.PROFILE_NFT_ADDRESS) {
    return res.status(500).json({
      error: { code: "ERR_NOT_CONFIGURED", message: "Backend not configured for gasless transactions" },
    });
  }

  try {
    const { ethers } = require("ethers");
    
    // Setup
    const rpcUrl = process.env.RPC_URL || "https://sepolia.base.org";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(process.env.BACKEND_SIGNER_PRIVATE_KEY, provider);
    
    // Load contract
    const profileABI = [
      "function register() external",
      "function hasProfile(address user) external view returns (bool)",
      "function getTokenId(address user) external pure returns (uint256)",
      "event ProfileRegistered(address indexed user)"
    ];
    
    const profileContract = new ethers.Contract(
      process.env.PROFILE_NFT_ADDRESS,
      profileABI,
      signer
    );

    console.log(`🎨 Registering Profile NFT for: ${authUser.walletAddress}`);
    
    // Check if already registered on-chain
    const hasProfile = await profileContract.hasProfile(authUser.walletAddress);
    if (hasProfile) {
      const tokenId = await profileContract.getTokenId(authUser.walletAddress);
      await prisma.user.update({
        where: { id: authUser.id },
        data: { profileTokenId: Number(tokenId) },
      });
      return res.json({
        success: true,
        alreadyRegistered: true,
        tokenId: Number(tokenId),
        message: "Profile already registered on-chain",
      });
    }
    
    // Register (backend pays gas)
    const tx = await profileContract.register({ from: authUser.walletAddress });
    console.log(`⏳ Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Confirmed in block ${receipt.blockNumber}`);
    
    // Get token ID
    const tokenId = await profileContract.getTokenId(authUser.walletAddress);
    
    // Update database
    await prisma.user.update({
      where: { id: authUser.id },
      data: { profileTokenId: Number(tokenId) },
    });
    
    console.log(`✅ Profile registered! Token ID: ${tokenId}`);
    
    return res.json({
      success: true,
      tokenId: Number(tokenId),
      transactionHash: tx.hash,
      message: "Profile NFT registered successfully (FREE for you!)",
    });
    
  } catch (error) {
    console.error("Failed to register profile:", error);
    return res.status(500).json({
      error: {
        code: "ERR_REGISTER_FAILED",
        message: "Failed to register Profile NFT",
        details: error.message,
      },
    });
  }
});
```

### 2. Frontend API Client

Tambahkan ke `lib/api.ts`:

```typescript
/**
 * Auto-register Profile NFT (gasless for user)
 * POST /profile/auto-register
 */
export interface AutoRegisterProfileResponse {
  success: boolean;
  tokenId?: number;
  transactionHash?: string;
  alreadyRegistered?: boolean;
  message: string;
}

export async function autoRegisterProfile(): Promise<AutoRegisterProfileResponse> {
  return fetchAPI<AutoRegisterProfileResponse>('/profile/auto-register', {
    method: 'POST',
  });
}
```

### 3. Frontend Hook

Create `hooks/useAutoRegisterProfile.ts`:

```typescript
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { autoRegisterProfile } from '@/lib/api';

export function useAutoRegisterProfile() {
  const { user, authenticated } = usePrivy();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const register = async () => {
      if (!authenticated || !user) return;
      
      // Check if already done
      const done = localStorage.getItem('profile_registered');
      if (done === 'true') {
        setIsRegistered(true);
        return;
      }

      // Check JWT token
      const token = localStorage.getItem('runera_token');
      if (!token) {
        console.log('⚠️ No JWT token, skipping auto-register');
        return;
      }

      setIsRegistering(true);
      setError(null);

      try {
        console.log('🎨 Auto-registering Profile NFT (gasless)...');
        
        const result = await autoRegisterProfile();
        
        if (result.success) {
          console.log('✅ Profile registered!', result);
          localStorage.setItem('profile_registered', 'true');
          setIsRegistered(true);
        }
      } catch (err: any) {
        console.error('❌ Auto-register failed:', err);
        setError(err.message || 'Failed to register profile');
      } finally {
        setIsRegistering(false);
      }
    };

    // Wait for JWT auth
    const timer = setTimeout(register, 3000);
    return () => clearTimeout(timer);
  }, [authenticated, user]);

  return { isRegistering, isRegistered, error };
}
```

### 4. Integrate ke Home Page

Update `app/page.tsx`:

```typescript
import { useAutoRegisterProfile } from '@/hooks/useAutoRegisterProfile';

export default function Home() {
  const { isAuthenticating, isAuthenticated } = useJWTAuth();
  const { isRegistering, isRegistered, error: registerError } = useAutoRegisterProfile();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f5f7fa]">
        <div className="mx-auto max-w-md pb-28">
          
          {/* Profile Registration Status */}
          {isRegistering && (
            <div className="mx-5 mt-5 rounded-xl bg-purple-50 border-2 border-purple-200 p-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                <div>
                  <p className="text-sm font-bold text-purple-900">Creating Profile NFT...</p>
                  <p className="text-xs text-purple-700">FREE - No gas fees! 🎉</p>
                </div>
              </div>
            </div>
          )}

          {isRegistered && (
            <div className="mx-5 mt-5 rounded-xl bg-green-50 border-2 border-green-200 p-3">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-xs font-medium text-green-800">Profile NFT created! 🎉</p>
              </div>
            </div>
          )}

          {registerError && (
            <div className="mx-5 mt-5 rounded-xl bg-red-50 border-2 border-red-200 p-3">
              <p className="text-xs text-red-800">{registerError}</p>
            </div>
          )}

          {/* Rest of page */}
          <Header />
          <div className="px-5 mb-5">
            <WalletAddressDisplay />
          </div>
          <QuestCard />
          <RecentRun />
        </div>
        <BottomNavigation activeTab="Home" />
      </div>
    </AuthGuard>
  );
}
```

## 🔧 Backend Setup

### Environment Variables

Add to Railway (Backend):

```env
# Existing
BACKEND_SIGNER_PRIVATE_KEY=0x...
PROFILE_NFT_ADDRESS=0x725d729107C4bC61f3665CE1C813CbcEC7214343
RPC_URL=https://sepolia.base.org

# Optional: Monitor gas usage
GASLESS_ENABLED=true
```

### Grant Permissions

Backend wallet TIDAK perlu special role untuk call `register()` karena itu public function. Tapi backend wallet HARUS punya ETH untuk gas.

### Monitor Gas Usage

```javascript
// Add to backend
let gasUsed = 0;

app.get("/admin/gas-stats", async (req, res) => {
  const balance = await provider.getBalance(signer.address);
  res.json({
    backendWallet: signer.address,
    balance: ethers.formatEther(balance),
    gasUsed: ethers.formatEther(gasUsed),
  });
});
```

## 💰 Cost Analysis

- **Gas per register**: ~0.0001 ETH (~$0.0003 USD)
- **1000 users**: ~0.1 ETH (~$300 USD)
- **Faucet**: https://www.alchemy.com/faucets/base-sepolia

## ✅ Benefits

1. **User-Friendly** - No manual faucet needed
2. **Automatic** - Register on first login
3. **Scalable** - Backend handles all users
4. **Cost-Effective** - Very cheap on Base Sepolia

## 🧪 Testing

```bash
# 1. Start backend
cd Backend
npm start

# 2. Start frontend
cd ..
pnpm dev

# 3. Test flow:
# - Login with Google/Email
# - Wait 3 seconds
# - Check console: "🎨 Auto-registering Profile NFT..."
# - Check console: "✅ Profile registered!"
# - Check profile page - NFT should appear
# - User paid ZERO gas!
```

## 🚀 Next Steps

1. ✅ Fix `lib/api.ts` bug (DONE)
2. Add `/profile/auto-register` endpoint to backend
3. Add `autoRegisterProfile()` to `lib/api.ts`
4. Create `useAutoRegisterProfile.ts` hook
5. Integrate to home page
6. Test with new user
7. Monitor gas usage
8. Top up backend wallet when needed

## 📊 Alternative: Paymaster (Future)

For production, consider using **Paymaster** (ERC-4337):
- More decentralized
- User signs, paymaster pays
- Better for compliance

But for MVP, backend-sponsored is perfect!
