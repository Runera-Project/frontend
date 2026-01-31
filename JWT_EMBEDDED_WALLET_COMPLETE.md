# JWT Authentication with Embedded Wallets - Complete Fix

## Status: ✅ FIXED

## Problem Summary

Users were unable to authenticate with the backend when using:
1. **Embedded wallets** (Google/Email login via Privy)
2. **External wallets** (MetaMask, WalletConnect)

Error: `wallet.signMessage is not a function`

## Root Cause

The Privy SDK's wallet object doesn't expose a direct `signMessage()` method. Instead, we need to:
1. Get the EIP-1193 Ethereum provider from the wallet
2. Use the provider's `request()` method with `personal_sign`
3. Pass the message as plain text (provider handles conversion)

## Solution Implemented

### 1. Updated JWT Authentication Hook (`hooks/useJWTAuth.ts`)

**Key Changes:**
- Use `wallet.getEthereumProvider()` to get EIP-1193 provider
- Use `provider.request({ method: 'personal_sign', params: [message, address] })`
- Added comprehensive error handling with user-friendly messages
- Added detailed console logging for debugging

**Code:**
```typescript
// Get the wallet provider (EIP-1193 provider)
const provider = await wallet.getEthereumProvider();

// Sign message using personal_sign
const signature = await provider.request({
  method: 'personal_sign',
  params: [message, walletAddress],
}) as string;
```

### 2. Enhanced Error Handling

Added specific error messages for:
- ✅ Database errors (Railway service down)
- ✅ Network errors (Backend unreachable)
- ✅ Signature errors (Signing or verification failed)
- ✅ Nonce errors (Session expired)
- ✅ Wallet errors (Wallet not connected)

### 3. Improved User Experience

- Shows authentication status banner on home page
- Displays user-friendly error messages
- Allows app to continue with limited functionality if auth fails
- Comprehensive console logging for debugging

## How It Works

### Authentication Flow

1. **User logs in** (Google/Email/Wallet)
   - Privy creates embedded wallet for Google/Email users
   - External wallet users connect their wallet

2. **JWT Authentication** (automatic on home page)
   - Request nonce from backend: `POST /auth/nonce`
   - Backend generates nonce and message: `RUNERA login\nNonce: {nonce}`
   - Find wallet from Privy's `useWallets()` hook
   - Get EIP-1193 provider: `wallet.getEthereumProvider()`
   - Sign message: `provider.request({ method: 'personal_sign', ... })`
   - Send signature to backend: `POST /auth/connect`
   - Backend verifies signature using ethers.js `verifyMessage()`
   - Backend returns JWT token
   - Token saved to localStorage

3. **Token Validation**
   - Check if token exists in localStorage
   - Decode token to verify wallet address matches
   - Check if token is expired
   - Clear token if wallet mismatch or expired

4. **Authenticated Requests**
   - All API requests include: `Authorization: Bearer {token}`
   - Backend extracts wallet address from JWT
   - Backend validates token signature

## Backend Verification

The backend uses ethers.js to verify signatures:

```javascript
const recovered = verifyMessage(message, signature);
if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
  throw new Error('Signature mismatch');
}
```

This works because:
- `personal_sign` adds Ethereum message prefix: `\x19Ethereum Signed Message:\n{length}{message}`
- `verifyMessage` expects this format and recovers the signer address
- Recovered address is compared with the wallet address

## Compatibility

This solution works with:
- ✅ Privy embedded wallets (Google/Email login)
- ✅ MetaMask
- ✅ WalletConnect
- ✅ Coinbase Wallet
- ✅ Any EIP-1193 compatible wallet

## Testing

### Test with Embedded Wallet (Google/Email)
1. Open app in browser
2. Click "Login with Google" or "Login with Email"
3. Complete Privy authentication
4. Wallet address should appear on home page
5. Check console for: "✅ Message signed successfully"
6. Check home page for: "Authenticated with backend" banner
7. Verify JWT token in localStorage: `runera_token`

### Test with External Wallet (MetaMask)
1. Open app in browser
2. Click "Connect Wallet"
3. Connect MetaMask
4. Approve signature request in MetaMask
5. Check console for: "✅ Message signed successfully"
6. Check home page for: "Authenticated with backend" banner
7. Verify JWT token in localStorage: `runera_token`

### Test Wallet Switching
1. Login with Wallet 1
2. Submit a run (should work)
3. Logout
4. Login with Wallet 2
5. Submit a run (should work - no wallet mismatch error)

## Console Logs

### Successful Authentication
```
🔐 Starting JWT authentication...
📍 Wallet address: 0x1234...
📡 Requesting nonce from backend...
✅ Nonce received: abc123...
📝 Message to sign: RUNERA login\nNonce: abc123...
✍️ Requesting signature from wallet...
Available wallets: 1
✅ Found wallet: { address: '0x1234...', type: 'privy' }
✅ Got Ethereum provider
📝 Message to sign: RUNERA login\nNonce: abc123...
✅ Message signed successfully
✅ Signature: 0x5678...
🔗 Connecting to backend...
✅ JWT token received and saved for wallet: 0x1234...
```

### Failed Authentication (with helpful error)
```
❌ Backend authentication failed: Error: Failed to create nonce
💾 Database error - Railway service might be down
📝 User-friendly error: Backend database error. Please try again later.
```

## Files Modified

1. `hooks/useJWTAuth.ts` - Updated signing logic and error handling
2. `JWT_SIGNING_FIX.md` - Documentation of the fix
3. `JWT_EMBEDDED_WALLET_COMPLETE.md` - This comprehensive guide

## Environment Variables

Ensure these are set in `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://backend-production-dfd3.up.railway.app
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_PRIVY_APP_ID=cmky60ltc00vpl80cuca2k36w
```

Backend environment variables (Railway):
```env
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...
BACKEND_SIGNER_PRIVATE_KEY=0x...
PROFILE_NFT_ADDRESS=0x725d729107C4bC61f3665CE1C813CbcEC7214343
CHAIN_ID=84532
```

## Troubleshooting

### Issue: "Wallet not found for signing"
**Solution:** Wait for Privy to load wallets. The hook waits for `wallets.length > 0`.

### Issue: "Backend database error"
**Solution:** Check Railway service status. Database might be sleeping or down.

### Issue: "Cannot connect to backend"
**Solution:** Check internet connection and backend URL in `.env.local`.

### Issue: "Signature verification failed"
**Solution:** Ensure message format matches between frontend and backend. Backend expects: `RUNERA login\nNonce: {nonce}`.

### Issue: "Nonce expired"
**Solution:** Nonce expires after 5 minutes. Request a new nonce by refreshing the page.

### Issue: "Wallet mismatch"
**Solution:** Logout and login again. JWT token is cleared on logout.

## Next Steps

1. ✅ Test with Google login
2. ✅ Test with Email login
3. ✅ Test with MetaMask
4. ✅ Test wallet switching
5. ✅ Test run submission with JWT auth
6. ✅ Verify backend receives correct wallet address from JWT

## References

- [EIP-1193: Ethereum Provider JavaScript API](https://eips.ethereum.org/EIPS/eip-1193)
- [EIP-191: Signed Data Standard](https://eips.ethereum.org/EIPS/eip-191)
- [Privy Wallet Documentation](https://docs.privy.io/guide/react/wallets/usage)
- [ethers.js verifyMessage](https://docs.ethers.org/v6/api/utils/#verifyMessage)
- [personal_sign JSON-RPC method](https://docs.metamask.io/wallet/reference/personal_sign/)
