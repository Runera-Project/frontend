# JWT Wallet Mismatch Analysis

## Date: January 31, 2026

## Problem Discovery
User reported that wallet `0x861dAf6755859b0B1a10bacfe0feD8f6727955E9` can successfully submit transactions, but user's wallet `0x2D8424E12f8CF0c057aC67b7371B3aAba4AFbF28` cannot.

## Root Cause: JWT Authentication Mismatch

### How JWT Works in Backend

The backend (`Backend/src/server.js`) has JWT authentication that validates wallet addresses:

```javascript
async function getUserFromAuthHeader(req) {
  const authHeader = typeof req.headers.authorization === "string" ? req.headers.authorization : "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  
  const payload = jwt.verify(token, JWT_SECRET);
  
  // JWT contains walletAddress
  if (payload.walletAddress && isValidWalletAddress(String(payload.walletAddress))) {
    return prisma.user.findUnique({
      where: { walletAddress: normalizeWalletAddress(String(payload.walletAddress)) },
    });
  }
}
```

### The Critical Check in `/run/submit`

```javascript
app.post("/run/submit", async (req, res) => {
  const authUser = await getUserFromAuthHeader(req);  // ← Gets user from JWT
  const rawWallet = typeof raw.walletAddress === "string" ? raw.walletAddress.trim() : "";

  // ⚠️ THIS IS THE PROBLEM!
  if (authUser && rawWallet && normalizeWalletAddress(rawWallet) !== authUser.walletAddress) {
    return res.status(403).json({
      error: {
        code: "ERR_WALLET_MISMATCH",
        message: "walletAddress does not match authenticated user",
      },
    });
  }
}
```

## What This Means

### Scenario 1: Working Wallet (0x861d...)
1. User logs in with wallet `0x861d...`
2. Backend issues JWT with `walletAddress: "0x861d..."`
3. User submits run with `walletAddress: "0x861d..."`
4. Backend checks: JWT wallet === submitted wallet ✅
5. Transaction succeeds!

### Scenario 2: Your Wallet (0x2D84...)
1. You logged in with wallet `0x861d...` (or another wallet)
2. Backend issued JWT with `walletAddress: "0x861d..."`
3. You switched to wallet `0x2D84...` in MetaMask
4. You submit run with `walletAddress: "0x2D84..."`
5. Backend checks: JWT wallet (`0x861d...`) !== submitted wallet (`0x2D84...`) ❌
6. Backend returns: `ERR_WALLET_MISMATCH` (403 Forbidden)
7. Transaction fails!

## Why This Happens

### JWT Token is Stored in Browser
When you log in with Privy, the JWT token is stored in:
- LocalStorage
- SessionStorage
- Cookies

The JWT contains the wallet address you used during login. If you:
1. Log in with wallet A
2. Switch to wallet B in MetaMask
3. Try to submit a run

The backend will reject it because:
- JWT says you're wallet A
- But you're trying to submit as wallet B

## How to Verify This is Your Issue

### Check Frontend Code
Let me check how the frontend sends the JWT:

```typescript
// In lib/api.ts or wherever API calls are made
const token = localStorage.getItem('privy:token');  // ← This is the JWT
const response = await fetch('/run/submit', {
  headers: {
    'Authorization': `Bearer ${token}`,  // ← JWT sent here
  },
  body: JSON.stringify({
    walletAddress: currentWallet,  // ← Current wallet from MetaMask
  })
});
```

### Check Browser Console
Look for error messages like:
```
POST /run/submit 403 (Forbidden)
{
  "error": {
    "code": "ERR_WALLET_MISMATCH",
    "message": "walletAddress does not match authenticated user"
  }
}
```

## Solutions

### Solution 1: Re-login with Correct Wallet (Immediate Fix)
1. Disconnect from Privy
2. Clear browser storage (F12 → Application → Clear Storage)
3. Switch MetaMask to wallet `0x2D84...`
4. Login again with Privy using wallet `0x2D84...`
5. Try submitting run again

### Solution 2: Update Frontend to Handle Wallet Changes
Update the frontend to detect wallet changes and re-authenticate:

```typescript
// In app/providers.tsx or a custom hook
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';

function useWalletSync() {
  const { user, logout, login } = usePrivy();
  const { address } = useAccount();
  
  useEffect(() => {
    // If wallet changed, force re-login
    if (user && address && user.wallet?.address !== address) {
      console.warn('Wallet mismatch detected, re-authenticating...');
      logout();
      // Optionally auto-login with new wallet
    }
  }, [address, user]);
}
```

### Solution 3: Backend Accepts Multiple Wallets (Advanced)
Modify backend to allow users to have multiple wallets:

```javascript
// Backend/src/server.js
app.post("/run/submit", async (req, res) => {
  const authUser = await getUserFromAuthHeader(req);
  const rawWallet = typeof raw.walletAddress === "string" ? raw.walletAddress.trim() : "";

  // Check if wallet belongs to authenticated user
  if (authUser && rawWallet) {
    const walletBelongsToUser = await prisma.userWallet.findFirst({
      where: {
        userId: authUser.id,
        walletAddress: normalizeWalletAddress(rawWallet),
      }
    });
    
    if (!walletBelongsToUser) {
      return res.status(403).json({
        error: {
          code: "ERR_WALLET_NOT_LINKED",
          message: "Wallet not linked to authenticated user",
        },
      });
    }
  }
  
  // Continue with run submission...
});
```

## Debugging Steps

### 1. Check Current JWT Token
Open browser console and run:
```javascript
// Check Privy token
const privyToken = localStorage.getItem('privy:token');
if (privyToken) {
  const payload = JSON.parse(atob(privyToken.split('.')[1]));
  console.log('JWT Wallet:', payload.walletAddress);
}

// Check current MetaMask wallet
console.log('MetaMask Wallet:', window.ethereum.selectedAddress);
```

### 2. Check Backend Logs
If you have access to Railway logs:
```bash
# Look for ERR_WALLET_MISMATCH errors
# Check which wallet is in JWT vs which wallet is being submitted
```

### 3. Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Submit a run
4. Find the `/run/submit` request
5. Check:
   - Request Headers → Authorization (JWT token)
   - Request Body → walletAddress
   - Response → Error message

## Expected Behavior After Fix

### Before Fix:
```
JWT Wallet: 0x861d...
Submitted Wallet: 0x2D84...
Result: ❌ ERR_WALLET_MISMATCH (403)
```

### After Fix:
```
JWT Wallet: 0x2D84...
Submitted Wallet: 0x2D84...
Result: ✅ Transaction succeeds
```

## Quick Test

Run this in browser console to see if there's a mismatch:
```javascript
// Get JWT wallet
const token = localStorage.getItem('privy:token');
const jwtWallet = token ? JSON.parse(atob(token.split('.')[1])).walletAddress : 'No JWT';

// Get current wallet
const currentWallet = window.ethereum?.selectedAddress || 'No wallet';

console.log('JWT Wallet:', jwtWallet);
console.log('Current Wallet:', currentWallet);
console.log('Match:', jwtWallet.toLowerCase() === currentWallet.toLowerCase() ? '✅' : '❌');
```

## Recommendation

**IMMEDIATE ACTION:**
1. Clear browser storage
2. Re-login with wallet `0x2D84...`
3. Test transaction

This should fix the issue immediately without any code changes!
