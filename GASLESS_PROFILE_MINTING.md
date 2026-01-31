# Gasless Profile NFT Minting - Solusi untuk User Baru

## Problem
User baru yang login dengan Google/Email tidak punya ETH Base Sepolia untuk membayar gas fee saat minting Profile NFT.

## Solusi: Backend-Sponsored Minting

Backend akan melakukan minting Profile NFT untuk user baru secara otomatis menggunakan wallet backend.

### Arsitektur

```
User Login (Google/Email)
    ↓
Embedded Wallet Created (Privy)
    ↓
JWT Authentication
    ↓
Backend Check: User punya Profile NFT?
    ↓ (No)
Backend Mint Profile NFT untuk user (GASLESS untuk user)
    ↓
User dapat Profile NFT tanpa bayar gas!
```

### Implementation

#### 1. Backend Endpoint: Auto-Mint Profile

**File:** `Backend/src/server.js`

Tambahkan endpoint baru:

```javascript
/**
 * Auto-mint Profile NFT for new users (gasless for user)
 * POST /profile/auto-mint
 */
app.post("/profile/auto-mint", async (req, res) => {
  const authUser = await getUserFromAuthHeader(req);
  
  if (!authUser) {
    return res.status(401).json({
      error: {
        code: "ERR_UNAUTHORIZED",
        message: "Authentication required",
      },
    });
  }

  // Check if user already has Profile NFT
  if (authUser.profileTokenId !== null) {
    return res.json({
      success: true,
      alreadyMinted: true,
      tokenId: authUser.profileTokenId,
      message: "Profile NFT already exists",
    });
  }

  // Check if backend can mint (needs MINTER_ROLE)
  if (!process.env.BACKEND_SIGNER_PRIVATE_KEY || !process.env.PROFILE_NFT_ADDRESS) {
    return res.status(500).json({
      error: {
        code: "ERR_BACKEND_NOT_CONFIGURED",
        message: "Backend minting not configured",
      },
    });
  }

  try {
    const { ethers } = require("ethers");
    
    // Setup provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "https://sepolia.base.org");
    const signer = new ethers.Wallet(process.env.BACKEND_SIGNER_PRIVATE_KEY, provider);
    
    // Load Profile NFT contract
    const profileABI = require("../ABI2/RuneraProfileABI.json");
    const profileContract = new ethers.Contract(
      process.env.PROFILE_NFT_ADDRESS,
      profileABI,
      signer
    );

    console.log(`🎨 Minting Profile NFT for user: ${authUser.walletAddress}`);
    
    // Mint Profile NFT (backend pays gas)
    const tx = await profileContract.mint(authUser.walletAddress);
    console.log(`⏳ Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Get token ID from event
    const mintEvent = receipt.logs.find(log => {
      try {
        const parsed = profileContract.interface.parseLog(log);
        return parsed && parsed.name === 'Transfer';
      } catch {
        return false;
      }
    });
    
    let tokenId = null;
    if (mintEvent) {
      const parsed = profileContract.interface.parseLog(mintEvent);
      tokenId = Number(parsed.args.tokenId);
    }
    
    // Update user record
    await prisma.user.update({
      where: { id: authUser.id },
      data: { profileTokenId: tokenId },
    });
    
    console.log(`✅ Profile NFT minted! Token ID: ${tokenId}`);
    
    return res.json({
      success: true,
      tokenId,
      transactionHash: tx.hash,
      message: "Profile NFT minted successfully (gasless for you!)",
    });
    
  } catch (error) {
    console.error("Failed to mint Profile NFT:", error);
    return res.status(500).json({
      error: {
        code: "ERR_MINT_FAILED",
        message: "Failed to mint Profile NFT",
        details: error.message,
      },
    });
  }
});
```

#### 2. Frontend: Auto-Request Minting

**File:** `hooks/useAutoMintProfile.ts` (NEW)

```typescript
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useAutoMintProfile() {
  const { user, authenticated } = usePrivy();
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const autoMintProfile = async () => {
      if (!authenticated || !user) return;
      
      // Check if already minted
      const alreadyMinted = localStorage.getItem('profile_nft_minted');
      if (alreadyMinted === 'true') {
        setMintSuccess(true);
        return;
      }

      // Get JWT token
      const token = localStorage.getItem('runera_token');
      if (!token) {
        console.log('⚠️ No JWT token, skipping auto-mint');
        return;
      }

      setIsMinting(true);
      setError(null);

      try {
        console.log('🎨 Requesting gasless Profile NFT mint...');
        
        const response = await fetch(`${API_URL}/profile/auto-mint`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          console.log('✅ Profile NFT minted!', data);
          localStorage.setItem('profile_nft_minted', 'true');
          setMintSuccess(true);
        }
      } catch (err: any) {
        console.error('❌ Auto-mint failed:', err);
        setError(err.message || 'Failed to mint Profile NFT');
      } finally {
        setIsMinting(false);
      }
    };

    // Wait a bit for JWT auth to complete
    const timer = setTimeout(autoMintProfile, 2000);
    return () => clearTimeout(timer);
  }, [authenticated, user]);

  return { isMinting, mintSuccess, error };
}
```

#### 3. Integrate ke Home Page

**File:** `app/page.tsx`

```typescript
import { useAutoMintProfile } from '@/hooks/useAutoMintProfile';

export default function Home() {
  const { address } = useAccount();
  const { isAuthenticating, isAuthenticated, error: authError } = useJWTAuth();
  const { isMinting, mintSuccess, error: mintError } = useAutoMintProfile();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f5f7fa]">
        <div className="mx-auto max-w-md pb-28">
          
          {/* Auto-Mint Status Banner */}
          {isMinting && (
            <div className="mx-5 mt-5 rounded-xl bg-purple-50 border-2 border-purple-200 p-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                <div>
                  <p className="text-sm font-bold text-purple-900">Creating your Profile NFT...</p>
                  <p className="text-xs text-purple-700">This is FREE - no gas fees!</p>
                </div>
              </div>
            </div>
          )}

          {mintSuccess && (
            <div className="mx-5 mt-5 rounded-xl bg-green-50 border-2 border-green-200 p-3">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-xs font-medium text-green-800">Profile NFT created! 🎉</p>
              </div>
            </div>
          )}

          {/* Rest of your home page */}
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

### Keuntungan Solusi Ini

✅ **Gasless untuk User** - Backend yang bayar gas
✅ **Otomatis** - Mint langsung setelah login
✅ **User-Friendly** - User tidak perlu faucet manual
✅ **Scalable** - Backend bisa mint untuk banyak user

### Biaya untuk Backend

- Gas per mint: ~0.0001 ETH (~$0.0003 USD)
- Untuk 1000 user: ~0.1 ETH (~$300 USD)
- Bisa pakai faucet otomatis untuk isi wallet backend

### Backend Requirements

1. **Private Key dengan MINTER_ROLE**
   ```bash
   # Di smart contract, grant MINTER_ROLE ke backend wallet
   ```

2. **Environment Variables**
   ```env
   BACKEND_SIGNER_PRIVATE_KEY=0x...
   PROFILE_NFT_ADDRESS=0x725d729107C4bC61f3665CE1C813CbcEC7214343
   RPC_URL=https://sepolia.base.org
   ```

3. **ETH Balance**
   - Backend wallet harus punya ETH untuk gas
   - Monitor balance dan isi ulang jika perlu

### Alternative: Paymaster (Advanced)

Jika mau lebih advanced, bisa pakai **Paymaster** (ERC-4337):
- User sign transaction
- Paymaster bayar gas
- Lebih decentralized

Tapi untuk MVP, backend-sponsored minting sudah cukup!

---

## Next Steps

1. ✅ Fix bug di `lib/api.ts` (DONE)
2. Add endpoint `/profile/auto-mint` di backend
3. Create hook `useAutoMintProfile.ts`
4. Integrate ke home page
5. Grant MINTER_ROLE ke backend wallet
6. Test dengan user baru (Google/Email login)

## Testing

```bash
# 1. Login dengan Google/Email
# 2. Check console:
#    "🎨 Requesting gasless Profile NFT mint..."
#    "✅ Profile NFT minted!"
# 3. Check profile page - NFT should appear
# 4. User tidak perlu bayar gas!
```
