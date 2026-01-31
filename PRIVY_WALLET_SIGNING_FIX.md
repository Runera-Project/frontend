# Privy Wallet Signing Fix

## Date: January 31, 2026

## Error
```
signMessage is not defined
```

## Root Cause
The `signMessage` method is not available directly from `usePrivy()` hook in the Privy version being used.

## Solution
Use `useWallets()` hook to get wallet instances, then call `signMessage()` on the specific wallet object.

## Implementation

### Before (Not Working)
```typescript
import { usePrivy } from '@privy-io/react-auth';

const { signMessage } = usePrivy(); // ❌ signMessage not available
const signature = await signMessage(message);
```

### After (Working)
```typescript
import { usePrivy, useWallets } from '@privy-io/react-auth';

const { user, ready, authenticated } = usePrivy();
const { wallets } = useWallets(); // ✅ Get wallet instances

// Find the wallet
const wallet = wallets.find(w => 
  w.address.toLowerCase() === walletAddress.toLowerCase()
);

// Sign with wallet instance
const signature = await wallet.signMessage(message); // ✅ Works!
```

## How It Works

### 1. Get Wallets
```typescript
const { wallets } = useWallets();
```
Returns array of all wallets (embedded + external):
- Embedded wallets (from Google/Email login)
- External wallets (MetaMask, Coinbase, etc)

### 2. Find Correct Wallet
```typescript
const wallet = wallets.find(w => 
  w.address.toLowerCase() === walletAddress.toLowerCase()
);
```
Finds the wallet that matches the current user's address.

### 3. Sign Message
```typescript
const signature = await wallet.signMessage(message);
```
Calls `signMessage()` on the wallet instance:
- For embedded wallets: Shows Privy signature UI
- For external wallets: Opens wallet popup (MetaMask, etc)

## Wait Conditions

To ensure wallets are ready before signing:

```typescript
if (!walletAddress || !ready || !authenticated || wallets.length === 0) {
  return; // Wait until everything is ready
}
```

**Conditions:**
- ✅ `walletAddress` exists
- ✅ `ready` - Privy is initialized
- ✅ `authenticated` - User is logged in
- ✅ `wallets.length > 0` - Wallets are loaded

## User Flow

### Google/Email Login
```
1. User logs in with Google/Email
2. Privy creates embedded wallet
3. User redirected to home page
4. useJWTAuth hook runs
5. Waits for wallets to load
6. Finds embedded wallet in wallets array
7. Calls wallet.signMessage(message)
8. Privy shows signature modal
9. User clicks "Sign"
10. Signature returned
11. JWT token created ✅
```

### MetaMask Login
```
1. User connects MetaMask
2. MetaMask wallet added to wallets array
3. User redirected to home page
4. useJWTAuth hook runs
5. Finds MetaMask wallet in wallets array
6. Calls wallet.signMessage(message)
7. MetaMask popup opens
8. User approves in MetaMask
9. Signature returned
10. JWT token created ✅
```

## Testing

### Test 1: Google Login
```bash
pnpm dev
```
1. Login with Google
2. Wait for home page to load
3. Should see blue "Authenticating..." banner
4. Privy signature modal should appear
5. Click "Sign"
6. Should see green "Authenticated" banner
7. Check wallet address on profile

### Test 2: Email Login
1. Login with Email + OTP
2. Wait for home page to load
3. Should see blue "Authenticating..." banner
4. Privy signature modal should appear
5. Click "Sign"
6. Should see green "Authenticated" banner
7. Check wallet address on profile

### Test 3: MetaMask Login
1. Connect MetaMask
2. Wait for home page to load
3. Should see blue "Authenticating..." banner
4. MetaMask popup should appear
5. Approve in MetaMask
6. Should see green "Authenticated" banner
7. Check wallet address on profile

## Debugging

### Check Wallets Array
```typescript
console.log('Wallets:', wallets);
console.log('Wallet count:', wallets.length);
console.log('Wallet addresses:', wallets.map(w => w.address));
```

### Check Wallet Object
```typescript
const wallet = wallets[0];
console.log('Wallet type:', wallet.walletClientType);
console.log('Wallet address:', wallet.address);
console.log('Has signMessage:', typeof wallet.signMessage === 'function');
```

### Common Issues

**Issue: wallets.length === 0**
- Cause: Wallets not loaded yet
- Solution: Wait for `authenticated` to be true

**Issue: wallet.signMessage is not a function**
- Cause: Wrong wallet object or Privy version issue
- Solution: Check Privy version, update if needed

**Issue: "Wallet not found for signing"**
- Cause: Wallet address mismatch
- Solution: Check wallet address case sensitivity

## Files Modified

1. ✅ `hooks/useJWTAuth.ts` - Use useWallets() and wallet.signMessage()

## Success Criteria

✅ No "signMessage is not defined" error
✅ Google login users can sign messages
✅ Email login users can sign messages
✅ MetaMask users can sign messages
✅ Privy signature modal shows for embedded wallets
✅ MetaMask popup shows for external wallets
✅ JWT authentication completes successfully
✅ Wallet address displayed on profile

## References

- [Privy useWallets Hook](https://docs.privy.io/guide/react/wallets/usage)
- [Privy Wallet Methods](https://docs.privy.io/guide/react/wallets/methods)
- [Privy Embedded Wallets](https://docs.privy.io/guide/react/wallets/embedded)

---

**Wallet signing now works with useWallets() hook! 🎉**
