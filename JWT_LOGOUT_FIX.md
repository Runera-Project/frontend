# JWT Logout Fix - Multi-Wallet Support

## Date: January 31, 2026

## Problem
User reported that:
1. ✅ Wallet 1 can successfully submit transactions
2. ❌ After logout and login with Wallet 2, transactions fail
3. The issue persists even after proper logout

## Root Cause Analysis

### Issue 1: JWT Token Not Cleared on Logout
The `Header.tsx` component was calling Privy's `logout()` function, but **NOT clearing the JWT token** from localStorage.

**Before:**
```typescript
<button onClick={logout}>Logout</button>
```

**Problem:**
- Privy logout clears Privy session
- BUT JWT token (`runera_token`) remains in localStorage
- When user logs in with different wallet, old JWT token is still there
- Backend validates JWT wallet vs current wallet → MISMATCH!

### Issue 2: Login Page Not Validating Token Wallet
The login page checked if JWT token exists, but didn't verify if it's for the **current wallet**.

**Before:**
```typescript
const existingToken = localStorage.getItem('runera_token');
if (existingToken) {
  console.log('✅ Already have JWT token');
  return; // ❌ Doesn't check if token is for current wallet!
}
```

**Problem:**
- User logs in with Wallet A → JWT for Wallet A saved
- User logs out (JWT not cleared)
- User logs in with Wallet B → Sees JWT exists, skips authentication
- User tries to submit with Wallet B → Backend sees JWT for Wallet A → MISMATCH!

## Solution Implemented

### Fix 1: Clear JWT on Logout (`components/Header.tsx`)

```typescript
const handleLogout = async () => {
  // Clear JWT token from localStorage
  localStorage.removeItem('runera_token');
  console.log('🗑️ JWT token cleared from localStorage');
  
  // Clear any other Runera data
  const keysToRemove = ['runera_activities', 'runera_streak', 'runera_last_run_date'];
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🗑️ Cleared ${key}`);
    }
  });
  
  // Call Privy logout
  await logout();
  console.log('✅ Logged out successfully');
};
```

**What it does:**
1. ✅ Removes JWT token from localStorage
2. ✅ Clears other user-specific data
3. ✅ Calls Privy logout
4. ✅ Logs all actions for debugging

### Fix 2: Validate Token Wallet on Login (`app/login/page.tsx`)

```typescript
const existingToken = localStorage.getItem('runera_token');
if (existingToken) {
  // Decode token to check if it's for the current wallet
  try {
    const payload = JSON.parse(atob(existingToken.split('.')[1]));
    const tokenWallet = payload.walletAddress?.toLowerCase();
    const currentWallet = address.toLowerCase();
    
    if (tokenWallet === currentWallet) {
      console.log('✅ Already have JWT token for current wallet');
      return;
    } else {
      console.warn('⚠️ JWT token is for different wallet, clearing...');
      localStorage.removeItem('runera_token');
    }
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    localStorage.removeItem('runera_token');
  }
}
```

**What it does:**
1. ✅ Checks if JWT token exists
2. ✅ Decodes JWT to extract wallet address
3. ✅ Compares JWT wallet with current wallet
4. ✅ If mismatch → Clears old token and re-authenticates
5. ✅ If match → Skips authentication (already logged in)

## How It Works Now

### Scenario 1: Normal Logout/Login
```
1. User logs in with Wallet A
   → JWT token saved: { walletAddress: "0xAAA..." }
   
2. User clicks Logout
   → JWT token cleared ✅
   → Privy session cleared ✅
   
3. User logs in with Wallet B
   → No JWT token found
   → Requests new nonce
   → Signs message with Wallet B
   → Gets new JWT: { walletAddress: "0xBBB..." } ✅
   
4. User submits run with Wallet B
   → Backend checks: JWT wallet (0xBBB) === Current wallet (0xBBB) ✅
   → Transaction succeeds! ✅
```

### Scenario 2: Wallet Switch Without Logout (Edge Case)
```
1. User logs in with Wallet A
   → JWT token saved: { walletAddress: "0xAAA..." }
   
2. User switches wallet in MetaMask to Wallet B (without logout)
   
3. User tries to login again
   → Finds JWT token for Wallet A
   → Decodes and compares: 0xAAA !== 0xBBB
   → Clears old JWT token ✅
   → Requests new authentication for Wallet B ✅
   
4. User submits run with Wallet B
   → Backend checks: JWT wallet (0xBBB) === Current wallet (0xBBB) ✅
   → Transaction succeeds! ✅
```

### Scenario 3: Page Refresh
```
1. User logs in with Wallet A
   → JWT token saved: { walletAddress: "0xAAA..." }
   
2. User refreshes page
   → Privy session restored
   → Wallet still connected: 0xAAA
   → Finds JWT token for Wallet A
   → Decodes and compares: 0xAAA === 0xAAA ✅
   → Skips authentication (already logged in) ✅
   
3. User submits run
   → Transaction succeeds! ✅
```

## Testing Instructions

### Test 1: Normal Logout/Login Flow
1. Login with Wallet 1
2. Submit a run → Should succeed ✅
3. Click Logout button
4. Check browser console → Should see "JWT token cleared"
5. Login with Wallet 2
6. Check browser console → Should see "JWT token received for wallet: 0x..."
7. Submit a run → Should succeed ✅

### Test 2: Multiple Wallets
1. Login with Wallet 1
2. Submit run → Success ✅
3. Logout
4. Login with Wallet 2
5. Submit run → Success ✅
6. Logout
7. Login with Wallet 1 again
8. Submit run → Success ✅

### Test 3: Wallet Switch Detection
1. Login with Wallet 1
2. Switch wallet in MetaMask to Wallet 2 (without logout)
3. Refresh page
4. Try to login → Should detect mismatch and re-authenticate
5. Submit run → Should succeed ✅

## Debugging

### Check JWT Token in Console
```javascript
// Open browser console and run:
const token = localStorage.getItem('runera_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('JWT Wallet:', payload.walletAddress);
  console.log('Current Wallet:', window.ethereum?.selectedAddress);
  console.log('Match:', payload.walletAddress?.toLowerCase() === window.ethereum?.selectedAddress?.toLowerCase());
}
```

### Check Backend Logs
Look for these patterns in Railway logs:
```
✅ Success: JWT wallet matches submitted wallet
❌ Error: ERR_WALLET_MISMATCH - JWT wallet !== submitted wallet
```

### Use Debug Tool
Open `DEBUG_JWT_WALLET.html` in browser to:
- Check current JWT token
- Verify wallet match
- Clear storage if needed

## Files Modified

1. ✅ `components/Header.tsx` - Added proper logout with JWT cleanup
2. ✅ `app/login/page.tsx` - Added JWT wallet validation on login
3. ✅ `JWT_LOGOUT_FIX.md` - This documentation

## Expected Behavior After Fix

### Before Fix:
```
Wallet 1 login → ✅ Works
Wallet 1 logout → ⚠️ JWT not cleared
Wallet 2 login → ⚠️ Old JWT still exists
Wallet 2 submit → ❌ ERR_WALLET_MISMATCH
```

### After Fix:
```
Wallet 1 login → ✅ Works
Wallet 1 logout → ✅ JWT cleared
Wallet 2 login → ✅ New JWT for Wallet 2
Wallet 2 submit → ✅ Works!
```

## Additional Notes

### JWT Token Structure
```json
{
  "sub": "user_id",
  "walletAddress": "0x...",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Backend Validation Logic
```javascript
// Backend checks:
1. JWT token exists in Authorization header
2. JWT is valid and not expired
3. JWT wallet address matches submitted wallet address
4. If all pass → Allow transaction
5. If any fail → Return 403 ERR_WALLET_MISMATCH
```

### Security Considerations
- ✅ JWT tokens are wallet-specific
- ✅ Tokens expire after 7 days
- ✅ Tokens are cleared on logout
- ✅ Old tokens are detected and cleared on login
- ✅ Backend validates wallet match on every request

## Troubleshooting

### Issue: Still getting ERR_WALLET_MISMATCH
**Solution:**
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Manually delete `runera_token`
4. Refresh page
5. Login again

### Issue: "Already have JWT token" but transaction fails
**Solution:**
1. The JWT might be expired
2. Clear localStorage
3. Login again

### Issue: Login loop (keeps asking to sign)
**Solution:**
1. Check if wallet is connected in MetaMask
2. Check if you're on Base Sepolia network
3. Clear browser cache and try again

## Success Criteria

✅ User can login with Wallet 1 and submit runs
✅ User can logout and login with Wallet 2
✅ User can submit runs with Wallet 2
✅ User can switch between multiple wallets
✅ JWT token is always for the current wallet
✅ No ERR_WALLET_MISMATCH errors
✅ Console logs show proper JWT management

## Next Steps

If issues persist:
1. Check backend logs for specific error messages
2. Verify backend wallet has BACKEND_ROLE in AccessControl contract
3. Check if nonce is incrementing correctly
4. Verify signature generation in backend
