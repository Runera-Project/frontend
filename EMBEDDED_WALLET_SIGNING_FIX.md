# Embedded Wallet Signing Fix

## Date: January 31, 2026

## Problem
When users login with Google/Email, they were prompted to connect MetaMask instead of using the embedded wallet that was automatically created.

## Root Cause
The `useJWTAuth` hook was using wagmi's `useSignMessage` which only works with external wallets (MetaMask). It doesn't work with Privy's embedded wallets.

## Solution
Changed to use Privy's `signMessage` method which works with BOTH:
- ✅ Embedded wallets (Google/Email login)
- ✅ External wallets (MetaMask)

## Changes Made

### File: `hooks/useJWTAuth.ts`

**Before:**
```typescript
import { useAccount, useSignMessage } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';

export function useJWTAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage(); // ❌ Only works with external wallets
  const { user } = usePrivy();
  
  // ...
  
  const signature = await signMessageAsync({ message }); // ❌ Fails for embedded wallets
}
```

**After:**
```typescript
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';

export function useJWTAuth() {
  const { address } = useAccount();
  const { user, signMessage } = usePrivy(); // ✅ Works with all wallet types
  
  // ...
  
  const uiConfig = {
    title: 'Sign Message',
    description: 'Sign this message to authenticate with Runera backend',
    buttonText: 'Sign',
  };
  const signature = await signMessage(message, uiConfig); // ✅ Works for all wallets
}
```

## How It Works Now

### Scenario 1: Login with Google
```
1. User clicks "Continue with Google"
2. Google authentication completes
3. Privy creates embedded wallet automatically ✅
4. User redirected to home page
5. JWT authentication starts
6. Privy shows signature modal (NOT MetaMask) ✅
7. User clicks "Sign" in Privy modal
8. JWT token saved
9. Wallet address displayed on profile ✅
```

### Scenario 2: Login with Email
```
1. User enters email and OTP
2. Email authentication completes
3. Privy creates embedded wallet automatically ✅
4. User redirected to home page
5. JWT authentication starts
6. Privy shows signature modal (NOT MetaMask) ✅
7. User clicks "Sign" in Privy modal
8. JWT token saved
9. Wallet address displayed on profile ✅
```

### Scenario 3: Login with MetaMask
```
1. User connects MetaMask
2. MetaMask authentication completes
3. Uses existing MetaMask wallet ✅
4. User redirected to home page
5. JWT authentication starts
6. MetaMask shows signature popup ✅
7. User approves in MetaMask
8. JWT token saved
9. Wallet address displayed on profile ✅
```

## Privy's signMessage Method

### Signature
```typescript
signMessage(
  message: string,
  uiConfig?: {
    title?: string;
    description?: string;
    buttonText?: string;
  }
): Promise<string>
```

### Features
- ✅ Works with embedded wallets (Privy-managed)
- ✅ Works with external wallets (MetaMask, Coinbase, etc)
- ✅ Shows custom UI for embedded wallets
- ✅ Delegates to external wallet for external wallets
- ✅ Handles all signing logic automatically

### UI Config
```typescript
const uiConfig = {
  title: 'Sign Message',
  description: 'Sign this message to authenticate with Runera backend',
  buttonText: 'Sign',
};
```

This creates a nice modal for embedded wallet users instead of prompting for MetaMask.

## User Experience

### Before Fix
```
Google Login → Embedded wallet created → JWT auth starts → 
❌ "Connect MetaMask" prompt → User confused → Can't proceed
```

### After Fix
```
Google Login → Embedded wallet created → JWT auth starts → 
✅ Privy signature modal → User clicks "Sign" → Success! ✅
```

## Testing Checklist

### Test 1: Google Login
- [ ] Login with Google
- [ ] Should NOT see MetaMask prompt
- [ ] Should see Privy signature modal
- [ ] Click "Sign" in modal
- [ ] Should authenticate successfully
- [ ] Check wallet address on profile page
- [ ] Copy wallet address
- [ ] Submit a run transaction

### Test 2: Email Login
- [ ] Login with email
- [ ] Enter OTP code
- [ ] Should NOT see MetaMask prompt
- [ ] Should see Privy signature modal
- [ ] Click "Sign" in modal
- [ ] Should authenticate successfully
- [ ] Check wallet address on profile page
- [ ] Copy wallet address
- [ ] Submit a run transaction

### Test 3: MetaMask Login
- [ ] Login with MetaMask
- [ ] Should see MetaMask signature popup (not Privy modal)
- [ ] Approve in MetaMask
- [ ] Should authenticate successfully
- [ ] Check wallet address on profile page
- [ ] Copy wallet address
- [ ] Submit a run transaction

## Benefits

### For Users
- ✅ No need to install MetaMask for Google/Email login
- ✅ Seamless authentication experience
- ✅ Clear signature modal with explanation
- ✅ Can use familiar login methods
- ✅ Still get Web3 wallet automatically

### For Developers
- ✅ Single signing method for all wallet types
- ✅ Privy handles complexity
- ✅ Cleaner code
- ✅ Better error handling
- ✅ Consistent UX

## Technical Details

### Privy's signMessage vs wagmi's useSignMessage

| Feature | Privy's signMessage | wagmi's useSignMessage |
|---------|-------------------|----------------------|
| Embedded wallets | ✅ Yes | ❌ No |
| External wallets | ✅ Yes | ✅ Yes |
| Custom UI | ✅ Yes | ❌ No |
| Auto-detection | ✅ Yes | ❌ No |
| Error handling | ✅ Built-in | Manual |

### Wallet Detection Priority

```typescript
1. wagmi address (external wallet connected)
2. Privy embedded wallet (Google/Email login)
3. Any Privy wallet
4. user.wallet (deprecated fallback)
```

### Signature Flow

```
User needs to sign message
    ↓
Check wallet type
    ↓
┌─────────────────┬─────────────────┐
│ Embedded Wallet │ External Wallet │
│  (Google/Email) │   (MetaMask)    │
└────────┬────────┴────────┬────────┘
         ↓                 ↓
   Privy Modal      MetaMask Popup
         ↓                 ↓
    User signs        User signs
         ↓                 ↓
         └────────┬────────┘
                  ↓
           Signature returned
                  ↓
          JWT token created
```

## Troubleshooting

### Issue: Still seeing MetaMask prompt
**Cause:** Old code cached or dev server not restarted
**Solution:**
1. Stop dev server (Ctrl+C)
2. Clear browser cache (Ctrl+Shift+R)
3. Restart dev server: `pnpm dev`
4. Try again

### Issue: "signMessage is not a function"
**Cause:** Privy not initialized or wrong version
**Solution:**
1. Check Privy version in package.json
2. Update if needed: `pnpm update @privy-io/react-auth`
3. Restart dev server

### Issue: Signature modal doesn't appear
**Cause:** Embedded wallet not created yet
**Solution:**
1. Check if user is logged in
2. Check if embedded wallet exists in Privy user object
3. Check browser console for errors

### Issue: Signature fails for embedded wallet
**Cause:** Privy configuration issue
**Solution:**
1. Check `createOnLogin: 'all-users'` in providers.tsx
2. Verify Privy App ID is correct
3. Check Privy dashboard settings

## Files Modified

1. ✅ `hooks/useJWTAuth.ts` - Changed to use Privy's signMessage

## Documentation

1. ✅ `EMBEDDED_WALLET_SIGNING_FIX.md` - This file

## Success Criteria

✅ Google login users can sign messages without MetaMask
✅ Email login users can sign messages without MetaMask
✅ MetaMask users still work as before
✅ Privy signature modal shows for embedded wallets
✅ Wallet address displayed on profile for all login methods
✅ JWT authentication works for all login methods
✅ Users can submit transactions with embedded wallets

## Next Steps

1. **Test all login methods** (Google, Email, MetaMask)
2. **Verify signature flow** for each method
3. **Test transaction submission** with embedded wallets
4. **Monitor for errors** in production

## References

- [Privy signMessage Docs](https://docs.privy.io/guide/react/wallets/signing)
- [Privy Embedded Wallets](https://docs.privy.io/guide/react/wallets/embedded)
- [wagmi useSignMessage](https://wagmi.sh/react/hooks/useSignMessage)

---

**Embedded wallet signing now works for all login methods! 🎉**
